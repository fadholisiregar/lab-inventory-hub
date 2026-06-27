<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengeluaranBarang;
use App\Models\DetailTransaksi;
use App\Models\BatchBarang;
use App\Models\Barang;
use App\Models\User;
use App\Mail\EmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PengeluaranBarangController extends Controller
{
    public function __construct(private \App\Services\NotificationService $notifier)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        $isKoordinator = $user->hasRole('Koordinator Gudang') || $user->hasRole('Koordinator');
        $isPetugas = $user->hasRole('Petugas Gudang');
        $isLaboran = $user->hasRole('Laboran');
        
        $statusKode = $request->query('status_kode');
        $statusKodeNot = $request->query('status_kode_not');

        $query = PengeluaranBarang::with(['statusTransaksi', 'creator', 'transaksi.pengaju', 'transaksi.disetujuiOleh', 'transaksi.dieksekusiOleh', 'transaksi.barang.satuan', 'transaksi.barang.kategori', 'transaksi.batchBarang', 'transaksi.barang.batchBarang', 'transaksi.batchAlokasi.batchBarang', 'ruangLaboratorium'])
            ->orderBy('created_at', 'desc');

        // Filter by user's role access (combining if user has multiple roles)
        if (!$isKoordinator && !$isPetugas) {
            $query->where(function($q) use ($user, $isLaboran) {
                if ($isLaboran) {
                    $q->orWhere('created_by', $user->id);
                }
            });
        }

        if ($statusKode) {
            $query->whereHas('statusTransaksi', function($q) use ($statusKode) {
                if (is_array($statusKode)) {
                    $q->whereIn('kode', $statusKode);
                } else {
                    $q->where('kode', $statusKode);
                }
            });
        }

        if ($statusKodeNot) {
            $query->whereHas('statusTransaksi', function($q) use ($statusKodeNot) {
                if (is_array($statusKodeNot)) {
                    $q->whereNotIn('kode', $statusKodeNot);
                } else {
                    $q->where('kode', '!=', $statusKodeNot);
                }
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasRole('Laboran')) {
            return response()->json(['message' => 'Unauthorized. Hanya Laboran yang dapat mengajukan permintaan barang.'], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|numeric|min:0.01',
            'keperluan' => 'nullable|string',
            'ruang_laboratorium_id' => 'required|exists:ruang_laboratorium,id',
            'jenis_kegiatan' => 'required|string',
            'judul_kegiatan' => 'required|string',
            'prodi_mitra' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BK-PENDING')->first();

            $transactionIdStr = 'TRX-BK-' . date('YmdHis') . '-' . rand(100, 999);

            $pengeluaranItems = [];
            foreach ($request->items as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                $totalStok = $barang->total_stok ?? 0;

                // Create Transaksi
                $transaksi = \App\Models\Transaksi::create([
                    'transaction_id' => $transactionIdStr,
                    'jenis' => 'Keluar',
                    'barang_id' => $barang->id,
                    'jumlah' => $item['jumlah'],
                    'stok_sebelum' => $totalStok,
                    'stok_sesudah' => $totalStok - $item['jumlah'],
                    'pengaju_id' => $request->user()->id,
                    'keperluan' => $request->keperluan
                ]);

                // Create PengeluaranBarang Header
                $pengeluaran = PengeluaranBarang::create([
                    'transaksi_id' => $transaksi->id,
                    'created_by' => $request->user()->id,
                    'ruang_laboratorium_id' => $request->ruang_laboratorium_id,
                    'jenis_kegiatan' => $request->jenis_kegiatan,
                    'judul_kegiatan' => $request->judul_kegiatan,
                    'prodi_mitra' => $request->prodi_mitra,
                    'kode_status_transaksi' => $statusPending->kode,
                ]);

                $pengeluaranItems[] = $pengeluaran;
            }

            DB::commit();

            // Notifikasi ke Koordinator Gudang (email + WhatsApp)
            $koordinators = User::whereHas('roles', function($q) {
                $q->where('name', 'Koordinator Gudang');
            })->get();

            $title = "Permintaan Bahan Baru dari " . $request->user()->name;
            $body = "Ada permohonan bahan/barang baru untuk kegiatan: {$request->judul_kegiatan}.\nHarap segera diperiksa dan diverifikasi melalui sistem Lab Inventory Hub.";

            $this->notifier->notifyUsers($koordinators, $title, $body);

            return response()->json(['message' => 'Pengeluaran barang berhasil diajukan dan menunggu verifikasi Koordinator.', 'transaksi' => $transaksi]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function verify(Request $request, $id)
    {
        $rules = [
            'status' => 'required|in:Disetujui,Ditolak',
            'catatan' => 'nullable|string'
        ];

        if ($request->status === 'Disetujui') {
            $rules['petugas_gudang_id'] = 'required|exists:petugas_gudang,id';
        }

        $request->validate($rules);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BK-PENDING')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusPending->kode) {
                return response()->json(['message' => 'Transaksi sudah diproses.'], 400);
            }

            $kodeStatus = $request->status === 'Disetujui' ? 'BK-DISETUJUI' : 'BK-DITOLAK';
            $statusUpdate = \App\Models\StatusTransaksi::where('kode', $kodeStatus)->first();

            $pengeluaran->kode_status_transaksi = $statusUpdate->kode;
            $pengeluaran->updated_by = $request->user()->id;
            if (empty($pengeluaran->created_by)) {
                $pengeluaran->created_by = $request->user()->id;
            }

            $transaksi = $pengeluaran->transaksi;

            if ($request->status === 'Disetujui') {
                $petugas = \App\Models\PetugasGudang::findOrFail($request->petugas_gudang_id);
                $barangMaster = Barang::find($transaksi->barang_id);

                if (!$barangMaster || $barangMaster->total_stok < $transaksi->jumlah) {
                    throw new \Exception("Stok total tidak mencukupi untuk barang: " . ($barangMaster ? $barangMaster->nama_barang : 'Unknown'));
                }

                // Koordinator hanya menyetujui permintaan & menugaskan petugas.
                // Pemilihan batch (FEFO untuk bahan berkadaluarsa) dan pemotongan
                // stok dilakukan saat Petugas Gudang mengeksekusi (lihat execute()).
                $transaksi->dieksekusi_oleh = $petugas->user_id;
                $transaksi->disetujui_oleh = $request->user()->id;
                $transaksi->save();
            }

            $pengeluaran->save();

            DB::commit();

            // Notifikasi hasil verifikasi ke pengaju (Laboran) — email + WhatsApp
            $pengaju = User::find($transaksi->created_by);
            if ($pengaju) {
                $title = "Hasil Verifikasi Permintaan Bahan";
                $body = "Permintaan bahan Anda untuk kegiatan: {$pengeluaran->judul_kegiatan}\nStatus: {$request->status}\nCatatan: " . ($request->catatan ?? '-');

                if ($request->status === 'Disetujui') {
                    $body .= "\n\nBarang Anda sedang disiapkan oleh Petugas Gudang.";
                }

                $this->notifier->notifyUsers($pengaju, $title, $body);
            }

            return response()->json(['message' => 'Verifikasi berhasil disimpan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function execute(Request $request, $id)
    {
        if (!$request->user()->hasRole('Petugas Gudang')) {
            return response()->json(['message' => 'Unauthorized. Hanya Petugas Gudang yang dapat mengeksekusi.'], 403);
        }

        $request->validate([
            'fisik_sesuai' => 'required|boolean',
            'catatan' => 'nullable|string',
            'batch_alokasi' => 'nullable|array',
            'batch_alokasi.*.batch_barang_id' => 'required_with:batch_alokasi|exists:batch_barang,id',
            'batch_alokasi.*.jumlah' => 'required_with:batch_alokasi|numeric|min:0.0001',
        ]);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            $transaksi = $pengeluaran->transaksi;

            $statusDisetujui = \App\Models\StatusTransaksi::where('kode', 'BK-DISETUJUI')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusDisetujui->kode) {
                return response()->json(['message' => 'Transaksi belum disetujui atau sudah dieksekusi.'], 400);
            }

            if ($request->fisik_sesuai) {
                $barangMaster = Barang::find($transaksi->barang_id);
                if (!$barangMaster) {
                    throw new \Exception("Barang tidak ditemukan.");
                }

                $jumlah = (float) $transaksi->jumlah;
                if ((float) $barangMaster->total_stok < $jumlah) {
                    throw new \Exception("Stok total tidak mencukupi untuk barang: {$barangMaster->nama_barang}");
                }

                // FEFO berlaku untuk bahan berkadaluarsa (umumnya bahan kimia).
                $useFefo = (bool) $barangMaster->perlu_kadaluarsa;
                $allocations = [];

                if ($useFefo && is_array($request->batch_alokasi) && count($request->batch_alokasi) > 0) {
                    // Petugas memilih batch secara manual (default FEFO, boleh override).
                    $totalDipilih = 0.0;
                    foreach ($request->batch_alokasi as $row) {
                        $ambil = (float) $row['jumlah'];
                        if ($ambil <= 0) continue;

                        $batch = \App\Models\BatchBarang::where('id', $row['batch_barang_id'])
                            ->where('barang_id', $transaksi->barang_id)
                            ->lockForUpdate()
                            ->first();

                        if (!$batch) {
                            throw new \Exception("Batch tidak valid untuk barang ini.");
                        }
                        if ($batch->status_batch !== 'Aktif') {
                            throw new \Exception("Batch {$batch->kode_batch} tidak aktif.");
                        }
                        if ((float) $batch->stok_tersisa < $ambil) {
                            throw new \Exception("Stok batch {$batch->kode_batch} tidak mencukupi (tersisa {$batch->stok_tersisa}).");
                        }

                        $allocations[] = ['batch' => $batch, 'jumlah' => $ambil];
                        $totalDipilih = round($totalDipilih + $ambil, 6);
                    }

                    if (abs($totalDipilih - $jumlah) > 0.0001) {
                        throw new \Exception("Total batch yang dipilih ({$totalDipilih}) tidak sama dengan jumlah diminta ({$jumlah}).");
                    }
                } else {
                    // FEFO otomatis (fallback) untuk bahan berkadaluarsa, atau pemotongan
                    // bookkeeping untuk barang non-kadaluarsa (tanpa aturan FEFO/FIFO eksplisit).
                    $batches = \App\Models\BatchBarang::where('barang_id', $transaksi->barang_id)
                        ->where('stok_tersisa', '>', 0)
                        ->where('status_batch', 'Aktif')
                        ->when($useFefo,
                            fn($q) => $q->orderByRaw('tgl_kadaluarsa IS NULL, tgl_kadaluarsa ASC'),
                            fn($q) => $q->orderBy('tgl_penerimaan', 'asc')
                        )
                        ->lockForUpdate()
                        ->get();

                    $remaining = $jumlah;
                    foreach ($batches as $batch) {
                        if ($remaining <= 0) break;
                        $take = min((float) $batch->stok_tersisa, $remaining);
                        $allocations[] = ['batch' => $batch, 'jumlah' => $take];
                        $remaining = round($remaining - $take, 6);
                    }

                    // Untuk bahan FEFO (berkadaluarsa) stok batch wajib mencukupi.
                    // Untuk barang non-kadaluarsa, pemotongan batch hanya bookkeeping
                    // mengikuti total stok yang sudah divalidasi di atas.
                    if ($useFefo && $remaining > 0.0001) {
                        throw new \Exception("Stok batch aktif tidak mencukupi. Kekurangan {$remaining} unit.");
                    }
                }

                // Potong stok pada setiap batch yang dialokasikan & catat riwayatnya.
                foreach ($allocations as $alloc) {
                    $batch = $alloc['batch'];
                    $batch->stok_tersisa = (float) $batch->stok_tersisa - (float) $alloc['jumlah'];
                    if ($batch->stok_tersisa <= 0.0000001) {
                        $batch->stok_tersisa = 0;
                        $batch->status_batch = 'Habis';
                    }
                    $batch->save();

                    \App\Models\TransaksiBatchAlokasi::create([
                        'transaksi_id'    => $transaksi->id,
                        'batch_barang_id' => $batch->id,
                        'jumlah_diambil'  => $alloc['jumlah'],
                    ]);
                }

                // Potong stok master & simpan riwayat stok pada transaksi.
                $transaksi->stok_sebelum = (float) $barangMaster->total_stok;
                $transaksi->stok_sesudah = (float) $barangMaster->total_stok - $jumlah;
                $transaksi->save();

                $barangMaster->total_stok = (float) $barangMaster->total_stok - $jumlah;
                $barangMaster->save();

                $statusMenunggu = \App\Models\StatusTransaksi::where('kode', 'BK-MENUNGGU')->first();
                $pengeluaran->kode_status_transaksi = $statusMenunggu->kode;
                $pengeluaran->save();
                DB::commit();
                return response()->json(['message' => 'Barang berhasil disiapkan. Menunggu konfirmasi Laboran.']);
            } else {
                // Titik 1: Fisik tidak sesuai (Stock Opname Required).
                // Pada alur baru stok belum dipotong sampai eksekusi, jadi tidak ada yang perlu dikembalikan.
                $statusDitolak = \App\Models\StatusTransaksi::where('kode', 'BK-DITOLAK')->first();
                $pengeluaran->kode_status_transaksi = $statusDitolak->kode;
                $pengeluaran->save();

                DB::commit();

                $koordinators = User::whereHas('roles', function($q) {
                    $q->where('name', 'Koordinator Gudang');
                })->get();

                $title = "Peringatan: Fisik Tidak Sesuai (Butuh Stock Opname)";
                $body = "Petugas Gudang melaporkan bahwa fisik barang tidak sesuai dengan sistem pada transaksi {$transaksi->transaction_id}.\nCatatan Petugas: " . ($request->catatan ?? 'Tidak ada') . "\nTransaksi ini telah dibatalkan otomatis. Harap segera lakukan penyesuaian (Stock Opname).";

                $this->notifier->notifyUsers($koordinators, $title, $body);

                return response()->json(['message' => 'Transaksi dibatalkan karena fisik tidak sesuai. Koordinator telah dinotifikasi.']);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function confirm(Request $request, $id)
    {
        if (!$request->user()->hasRole('Laboran')) {
            return response()->json(['message' => 'Unauthorized. Hanya Laboran yang dapat melakukan konfirmasi.'], 403);
        }

        $request->validate([
            'sesuai' => 'required|boolean',
            'catatan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            
            $statusMenunggu = \App\Models\StatusTransaksi::where('kode', 'BK-MENUNGGU')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusMenunggu->kode) {
                return response()->json(['message' => 'Status transaksi tidak valid untuk konfirmasi.'], 400);
            }
            
            if ($pengeluaran->created_by !== $request->user()->id) {
                return response()->json(['message' => 'Hanya pengaju asli yang dapat mengonfirmasi transaksi ini.'], 403);
            }

            $transaksi = $pengeluaran->transaksi;

            if ($request->sesuai) {
                $statusSelesai = \App\Models\StatusTransaksi::where('kode', 'BK-SELESAI')->first();
                $pengeluaran->kode_status_transaksi = $statusSelesai->kode;
                
                if ($transaksi) {
                    $transaksi->tanda_terima = true;
                    $transaksi->save();
                }
                
                $pengeluaran->save();

                DB::commit();
                return response()->json(['message' => 'Penerimaan barang berhasil dikonfirmasi. Transaksi selesai.']);
            } else {
                // Titik 2: Barang yang diterima Laboran tidak sesuai dengan Surat Jalan
                $statusDitolak = \App\Models\StatusTransaksi::where('kode', 'BK-DITOLAK')->first();
                $pengeluaran->kode_status_transaksi = $statusDitolak->kode;
                $pengeluaran->save();

                // Revert stock — gunakan alokasi multi-batch jika ada
                $master = Barang::find($transaksi->barang_id);
                if ($master) {
                    $master->total_stok = (float) $master->total_stok + (float) $transaksi->jumlah;
                    $master->save();
                }

                $this->revertBatchAlokasi($transaksi);

                DB::commit();

                $koordinators = User::whereHas('roles', function($q) {
                    $q->where('name', 'Koordinator Gudang');
                })->get();

                $title = "Laporan Ketidaksesuaian Penerimaan Barang";
                $body = "Laboran (" . $request->user()->name . ") melaporkan bahwa barang yang diterima tidak sesuai dengan Surat Jalan pada transaksi {$transaksi->transaction_id}.\nCatatan Laboran: " . ($request->catatan ?? 'Tidak ada') . "\nTransaksi ini telah dibatalkan. Harap selidiki lebih lanjut.";

                $this->notifier->notifyUsers($koordinators, $title, $body);

                return response()->json(['message' => 'Laporan ketidaksesuaian berhasil dikirim. Transaksi dibatalkan.']);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Kembalikan stok batch dari alokasi multi-batch, dengan fallback ke single batch lama.
     */
    private function revertBatchAlokasi(\App\Models\Transaksi $transaksi): void
    {
        $alokasis = \App\Models\TransaksiBatchAlokasi::where('transaksi_id', $transaksi->id)->get();

        if ($alokasis->count() > 0) {
            foreach ($alokasis as $alokasi) {
                $batch = \App\Models\BatchBarang::find($alokasi->batch_barang_id);
                if ($batch) {
                    $batch->stok_tersisa = (float) $batch->stok_tersisa + (float) $alokasi->jumlah_diambil;
                    $batch->save();
                }
            }
        } elseif ($transaksi->batch_barang_id) {
            // Backward compat: transaksi lama yang masih single-batch
            $batch = \App\Models\BatchBarang::find($transaksi->batch_barang_id);
            if ($batch) {
                $batch->stok_tersisa = (float) $batch->stok_tersisa + (float) $transaksi->jumlah;
                $batch->save();
            }
        }
    }

    public function downloadSuratJalan($id)
    {
        $pengeluaran = PengeluaranBarang::with([
            'transaksi.pengaju',
            'transaksi.disetujuiOleh',
            'transaksi.dieksekusiOleh',
            'transaksi.barang.satuan',
            'transaksi.batchAlokasi.batchBarang',
            'ruangLaboratorium',
        ])->findOrFail($id);

        // Surat jalan baru tersedia setelah pengeluaran fisik oleh Petugas Gudang
        // (status BK-MENUNGGU), bukan saat masih menunggu eksekusi (BK-DISETUJUI).
        $statusDiizinkan = ['BK-MENUNGGU', 'BK-SELESAI'];
        if (!in_array($pengeluaran->kode_status_transaksi, $statusDiizinkan)) {
            return response()->json(['message' => 'Surat jalan baru tersedia setelah barang dikeluarkan oleh Petugas Gudang.'], 422);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.surat-jalan', [
            'pengeluaran' => $pengeluaran,
        ]);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'Surat-Jalan-SJ-' . str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) . '.pdf';
        return $pdf->download($filename);
    }
}
