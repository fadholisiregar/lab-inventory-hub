<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BatchBarang;
use App\Models\PenerimaanBarang;
use App\Models\Satuan;
use App\Models\StatusTransaksi;
use App\Models\Penyedia;
use App\Models\JenisKegiatan;
use App\Models\Transaksi;
use App\Models\User;
use App\Models\Laboran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Imports\HeadingRowFormatter;

class ImportBarangMasukController extends Controller
{
    public function __construct(private \App\Services\NotificationService $notifier)
    {
    }

    /**
     * Import barang masuk dari file XLSX (SIGMA template).
     */
    public function import(Request $request)
    {
        if (!$request->user()->hasRole('Petugas Gudang') && !$request->user()->hasRole('Koordinator Gudang')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:5120', // max 5MB
        ]);

        try {
            $rows = $this->parseXlsx($request->file('file'));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membaca file XLSX.',
                'error' => $e->getMessage()
            ], 422);
        }

        if (empty($rows)) {
            return response()->json(['message' => 'Tidak ada baris data terbaca. Pastikan ada baris barang dengan Kode Barang terisi (mulai baris ke-5, hapus baris contoh kuning).'], 422);
        }

        if (count($rows) > 1000) {
            return response()->json(['message' => 'Terlalu banyak baris (' . count($rows) . '). Maksimal 1000 baris per import.'], 422);
        }

        // Pre-load master data for validation
        $masterBarang = Barang::with('satuan')->get()->keyBy('kode_barang');
        $masterSatuan = Satuan::all();
        $masterPenyedia = Penyedia::whereNotNull('kode_penyedia')->get()->keyBy('kode_penyedia');
        $masterJenisKegiatan = JenisKegiatan::where('aktif', true)->get()->keyBy(fn ($j) => strtolower($j->nama));
        $masterUsers = User::all();
        $masterLaboran = Laboran::with('user')->get();

        $errors = [];
        $warnings = [];
        $validRows = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 5; // Template data starts at row 5 (1-indexed)
            $rowErrors = [];
            $rowWarnings = [];

            // 1. Tanggal (required)
            $tanggal = $this->parseDate($row[0] ?? null);
            if (!$tanggal) {
                $rowErrors[] = ['field' => 'tanggal', 'message' => 'Format tanggal tidak valid. Gunakan DD/MM/YYYY.'];
            }

            // 2. Kode Barang (required, must exist)
            $kodeBarang = trim($row[1] ?? '');
            $barang = $masterBarang->get($kodeBarang);
            if (empty($kodeBarang)) {
                $rowErrors[] = ['field' => 'kode_barang', 'message' => 'Kode barang wajib diisi.'];
            } elseif (!$barang) {
                $rowErrors[] = ['field' => 'kode_barang', 'message' => "Kode barang '{$kodeBarang}' tidak ditemukan di master."];
            }

            // 3. Nama Barang (cross-verify with kode)
            $namaBarang = trim($row[2] ?? '');
            if ($barang && !empty($namaBarang)) {
                $similarity = 0;
                similar_text(strtolower($barang->nama_barang), strtolower($namaBarang), $similarity);
                if ($similarity < 40) {
                    $rowWarnings[] = ['field' => 'nama_barang', 'message' => "Nama '{$namaBarang}' berbeda signifikan dari master '{$barang->nama_barang}'. Pastikan kode barang benar."];
                }
            }

            // 4. Jumlah Masuk (required, positive)
            $jumlah = $this->parseNumber($row[3] ?? null);
            if ($jumlah === null || $jumlah <= 0) {
                $rowErrors[] = ['field' => 'jumlah_masuk', 'message' => 'Jumlah masuk harus angka positif (> 0).'];
            } elseif ($barang && !($barang->satuan?->is_desimal ?? false) && floor($jumlah) != $jumlah) {
                // Satuan non-desimal (mis. Pcs) hanya menerima bilangan bulat.
                $rowErrors[] = ['field' => 'jumlah_masuk', 'message' => "Jumlah harus bilangan bulat untuk satuan '" . ($barang->satuan?->simbol ?? '') . "'."];
            }

            // 5. Satuan (required, validasi ke master + alias simbol spec)
            $satuanInput = trim($row[4] ?? '');
            if (empty($satuanInput)) {
                $rowErrors[] = ['field' => 'satuan', 'message' => 'Satuan wajib diisi.'];
            } else {
                // Alias simbol spec -> simbol master (mL cocok 'ml' via case-insensitive).
                $aliases = ['l' => 'liter', 'pak' => 'pack', 'rol' => 'roll'];
                $needle = strtolower($satuanInput);
                $needle = $aliases[$needle] ?? $needle;
                $satuanMatch = $masterSatuan->first(function ($s) use ($needle) {
                    return strtolower($s->simbol) === $needle || strtolower($s->nama_satuan) === $needle;
                });
                if (!$satuanMatch) {
                    $daftar = $masterSatuan->pluck('simbol')->implode(', ');
                    $rowErrors[] = ['field' => 'satuan', 'message' => "Satuan '{$satuanInput}' tidak valid. Nilai yang diterima: {$daftar}."];
                }
                // Verify consistency with barang's satuan
                if ($barang && $satuanMatch && $barang->satuan_id !== $satuanMatch->id) {
                    $satuanMaster = $barang->satuan->simbol ?? '';
                    $rowWarnings[] = ['field' => 'satuan', 'message' => "Satuan '{$satuanInput}' berbeda dari satuan master barang '{$satuanMaster}'."];
                }
            }

            // 6. Kode Pemasok (required)
            $kodePemasok = trim($row[5] ?? '');
            $penyedia = null;
            if (empty($kodePemasok)) {
                $rowErrors[] = ['field' => 'kode_pemasok', 'message' => 'Kode penyedia wajib diisi.'];
            } else {
                $penyedia = $masterPenyedia->get($kodePemasok);
                if (!$penyedia) {
                    $rowErrors[] = ['field' => 'kode_pemasok', 'message' => "Kode penyedia '{$kodePemasok}' tidak ditemukan di master penyedia."];
                }
            }

            // 7. Jenis Kegiatan (required, dari master jenis_kegiatan)
            $jenisKegiatanInput = trim($row[6] ?? '');
            $jenisKegiatanModel = $jenisKegiatanInput !== '' ? $masterJenisKegiatan->get(strtolower($jenisKegiatanInput)) : null;
            if (empty($jenisKegiatanInput)) {
                $rowErrors[] = ['field' => 'jenis_kegiatan', 'message' => 'Jenis kegiatan wajib diisi.'];
            } elseif (!$jenisKegiatanModel) {
                $daftar = $masterJenisKegiatan->pluck('nama')->implode(', ');
                $rowErrors[] = ['field' => 'jenis_kegiatan', 'message' => "Jenis kegiatan '{$jenisKegiatanInput}' tidak valid. Nilai yang diterima: {$daftar}."];
            }

            // 8. Harga Total Dibayar (required; 0 hanya wajar utk Hibah/Sumbangan)
            $hargaTotal = $this->parseNumber($row[7] ?? null);
            if ($hargaTotal === null || $hargaTotal < 0) {
                $rowErrors[] = ['field' => 'harga_total', 'message' => 'Harga total harus angka (>= 0).'];
            } elseif ($hargaTotal == 0 && $jenisKegiatanModel && $jenisKegiatanModel->wajib_link_pengadaan) {
                $rowWarnings[] = ['field' => 'harga_total', 'message' => "Harga total 0 untuk kegiatan '{$jenisKegiatanModel->nama}'. Pastikan memang gratis."];
            }

            // 9. PIC Barang Masuk (optional, soft validate)
            $picName = trim($row[8] ?? '');
            $laboranId = null;
            if (!empty($picName)) {
                $laboranMatch = $masterLaboran->first(function ($l) use ($picName) {
                    return $l->user && strcasecmp($l->user->name, $picName) === 0;
                });
                if ($laboranMatch) {
                    $laboranId = $laboranMatch->id;
                } else {
                    $rowWarnings[] = ['field' => 'pic_barang_masuk', 'message' => "PIC '{$picName}' tidak ditemukan di master pengguna. Data tetap disimpan."];
                }
            }

            // 10. Petugas Gudang (required)
            $petugasName = trim($row[9] ?? '');
            $petugasUser = null;
            if (empty($petugasName)) {
                // Default to current logged-in user
                $petugasUser = $request->user();
            } else {
                $petugasUser = $masterUsers->first(function ($u) use ($petugasName) {
                    return strcasecmp($u->name, $petugasName) === 0;
                });
                if (!$petugasUser) {
                    $rowWarnings[] = ['field' => 'petugas_gudang', 'message' => "Petugas '{$petugasName}' tidak ditemukan. Menggunakan akun login saat ini."];
                    $petugasUser = $request->user();
                }
            }

            // 11. Link Pengadaan (wajib bila jenis kegiatan menandai wajib_link_pengadaan)
            $linkPengadaan = trim($row[10] ?? '');
            if ($jenisKegiatanModel && $jenisKegiatanModel->wajib_link_pengadaan && empty($linkPengadaan)) {
                $rowWarnings[] = ['field' => 'link_pengadaan', 'message' => "Link pengadaan sebaiknya diisi untuk jenis kegiatan '{$jenisKegiatanModel->nama}'."];
            }

            // 12. Keterangan (optional)
            $keterangan = trim($row[11] ?? '');

            // Collect errors/warnings
            foreach ($rowErrors as $err) {
                $errors[] = array_merge(['row' => $rowNum], $err);
            }
            foreach ($rowWarnings as $warn) {
                $warnings[] = array_merge(['row' => $rowNum], $warn);
            }

            // Only add to valid rows if no errors
            if (empty($rowErrors) && $barang && $jumlah > 0) {
                $hargaSatuan = ($jumlah > 0) ? round($hargaTotal / $jumlah, 2) : 0;

                $validRows[] = [
                    'tanggal' => $tanggal,
                    'barang' => $barang,
                    'jumlah' => $jumlah,
                    'penyedia' => $penyedia,
                    'jenis_kegiatan' => $jenisKegiatanModel?->nama,
                    'jenis_kegiatan_id' => $jenisKegiatanModel?->id,
                    'harga_total' => $hargaTotal,
                    'harga_satuan' => $hargaSatuan,
                    'laboran_id' => $laboranId,
                    'petugas_user' => $petugasUser,
                    'link_pengadaan' => $linkPengadaan,
                    'keterangan' => $keterangan,
                    'row_num' => $rowNum,
                ];
            }
        }

        // Process valid rows
        $successCount = 0;
        $createdItems = [];

        if (!empty($validRows)) {
            DB::beginTransaction();
            try {
                $statusPending = StatusTransaksi::where('kode', 'BM-PENDING')->first();
                $seq = 0;

                foreach ($validRows as $data) {
                    $barang = $data['barang'];

                    // Generate batch code: B + sequential per barang
                    $kodeBatch = BatchBarang::generateKodeBatch($barang->id);

                    // Create BatchBarang
                    $batch = BatchBarang::create([
                        'barang_id' => $barang->id,
                        'kode_batch' => $kodeBatch,
                        'tgl_penerimaan' => $data['tanggal'],
                        'jumlah_awal' => $data['jumlah'],
                        'stok_tersisa' => 0, // Will be updated on verification
                        'kondisi' => 'Baik',
                        'penyedia_id' => $data['penyedia']?->id,
                        'harga_satuan' => $data['harga_satuan'],
                        // Kadaluarsa diisi nanti (cek label fisik) untuk barang ber-FEFO.
                        'status_kadaluarsa' => $barang->perlu_kadaluarsa ? 'BelumDiinput' : null,
                        'status_batch' => 'Pending',
                    ]);

                    // Create Transaksi (Ledger) — id unik per baris (cegah tabrakan)
                    $transactionIdStr = sprintf('TRX-BM-%s-%04d%02d', date('YmdHis'), ++$seq, rand(10, 99));
                    $transaksi = Transaksi::create([
                        'transaction_id' => $transactionIdStr,
                        'jenis' => 'Masuk',
                        'barang_id' => $barang->id,
                        'batch_barang_id' => $batch->id,
                        'jumlah' => $data['jumlah'],
                        'stok_sebelum' => 0,
                        'stok_sesudah' => 0,
                        'pengaju_id' => null,
                        'disetujui_oleh' => null,
                        'dieksekusi_oleh' => $data['petugas_user']->id,
                        'keperluan' => $data['keterangan'] ?: 'Import XLSX',
                        'tanda_terima' => false,
                    ]);

                    // Create PenerimaanBarang
                    $penerimaan = PenerimaanBarang::create([
                        'transaksi_id' => $transaksi->id,
                        'harga_sebelum_ppn' => null,
                        'harga_total' => $data['harga_total'],
                        'harga_satuan' => $data['harga_satuan'],
                        'laboran_id' => $data['laboran_id'],
                        'jenis_kegiatan' => $data['jenis_kegiatan'],
                        'jenis_kegiatan_id' => $data['jenis_kegiatan_id'],
                        'link_pengadaan' => $data['link_pengadaan'] ?: null,
                        'kode_status_transaksi' => $statusPending?->kode ?? 'BM-PENDING',
                        'catatan' => $data['keterangan'] ?: null,
                        'sumber_input' => 'csv',
                        'created_by' => $request->user()->id,
                    ]);

                    $createdItems[] = $penerimaan;
                    $successCount++;
                }

                DB::commit();

                // Notify Koordinator Gudang
                if ($successCount > 0) {
                    $koordinators = User::whereHas('roles', function ($q) {
                        $q->where('name', 'Koordinator Gudang');
                    })->get();

                    $title = "Import Penerimaan Barang Baru";
                    $body = "Ada {$successCount} penerimaan barang baru diimport oleh " . $request->user()->name . ".\nHarap segera diperiksa dan diverifikasi melalui sistem Lab Inventory Hub.";

                    $this->notifier->notifyUsers($koordinators, $title, $body);
                }
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Gagal menyimpan data import.',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json([
            'message' => $successCount > 0
                ? "{$successCount} baris berhasil diimport."
                : 'Tidak ada baris yang berhasil diimport.',
            'success_count' => $successCount,
            'error_count' => count(array_unique(array_column($errors, 'row'))),
            'total_rows' => count($rows),
            'errors' => $errors,
            'warnings' => $warnings,
        ]);
    }

    /**
     * Download template XLSX kosong sesuai format SIGMA.
     */
    public function downloadTemplate()
    {
        // Sajikan template resmi (SIGMA/ITK) bila tersedia; fallback ke template
        // yang di-generate otomatis.
        $official = public_path('template/Template_Barang_Masuk_Gudang.xlsx');
        if (is_file($official)) {
            return response()->download($official);
        }

        return Excel::download(new \App\Exports\TemplateBarangMasukExport(), 'Template_Import_Barang_Masuk.xlsx');
    }

    /**
     * Parse XLSX file and return array of data rows (skip header rows 1-4).
     */
    private function parseXlsx($file): array
    {
        HeadingRowFormatter::default('none');

        $rawData = Excel::toArray(new class implements \Maatwebsite\Excel\Concerns\WithMultipleSheets {
            public function sheets(): array
            {
                return [
                    0 => new class implements \Maatwebsite\Excel\Concerns\ToArray, \Maatwebsite\Excel\Concerns\WithHeadingRow {
                        public function headingRow(): int
                        {
                            return 1; // Use row 1 as heading, we'll skip it
                        }

                        public function array(array $array): array
                        {
                            return $array;
                        }
                    }
                ];
            }
        }, $file);

        // Get first sheet data
        $sheetData = $rawData[0] ?? [];

        // Skip header rows (rows 1-4 in Excel = indices 0-3 in parsed array)
        // Since we set heading row to 1, the array starts from row 2
        // We need to skip rows 2, 3, 4 (indices 0, 1, 2) — they are sub-headers
        $dataRows = [];
        foreach ($sheetData as $index => $row) {
            if ($index < 3) continue; // Skip sub-header rows

            $values = array_values($row);

            // Sebuah baris dianggap DATA jika Kode Barang (kolom B / indeks 1)
            // terisi dan bukan placeholder dalam kurung siku (mis. "[otomatis]").
            // Pendekatan ini melewati baris kosong & baris contoh/instruksi
            // TANPA ikut membuang baris data nyata yang ditulis menimpa baris
            // contoh (kolom AUTO M-P yang masih "[...]" diabaikan).
            $kodeBarang = trim((string) ($values[1] ?? ''));
            if ($kodeBarang === '' || preg_match('/^\[.*\]$/', $kodeBarang)) {
                continue;
            }

            $dataRows[] = $values;
        }

        return $dataRows;
    }

    /**
     * Parse date from DD/MM/YYYY format or Excel serial number.
     */
    private function parseDate($value): ?string
    {
        if ($value === null || trim((string)$value) === '') {
            return null;
        }

        // Handle Excel serial date number
        if (is_numeric($value)) {
            try {
                $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((int)$value);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }

        $value = trim((string)$value);

        // Try DD/MM/YYYY
        $parts = preg_split('/[\/\-\.]/', $value);
        if (count($parts) === 3) {
            $day = (int)$parts[0];
            $month = (int)$parts[1];
            $year = (int)$parts[2];

            if ($year < 100) $year += 2000;

            if (checkdate($month, $day, $year)) {
                return sprintf('%04d-%02d-%02d', $year, $month, $day);
            }
        }

        // Try standard formats
        $formats = ['Y-m-d', 'd-m-Y', 'd/m/Y'];
        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $value);
            if ($date && $date->format($format) === $value) {
                return $date->format('Y-m-d');
            }
        }

        return null;
    }

    /**
     * Parse a number value (handles comma as thousands separator).
     */
    private function parseNumber($value): ?float
    {
        if ($value === null || trim((string)$value) === '') {
            return null;
        }

        if (is_numeric($value)) {
            return (float)$value;
        }

        // Remove 'Rp', spaces, dots as thousands separator
        $cleaned = preg_replace('/[Rp\s.]/', '', (string)$value);
        // Replace comma with dot for decimal
        $cleaned = str_replace(',', '.', $cleaned);

        return is_numeric($cleaned) ? (float)$cleaned : null;
    }

    /**
     * Generate batch code in format B001, B002, etc. per barang_id.
     */
}
