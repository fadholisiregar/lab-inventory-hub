<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\BatchBarang;
use App\Models\User;
use App\Mail\EmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PenerimaanBarangController extends Controller
{
    public function __construct(private \App\Services\NotificationService $notifier)
    {
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        $isKoordinator = $user->hasRole('Koordinator Gudang') || $user->hasRole('Koordinator');
        $isPetugas = $user->hasRole('Petugas Gudang');
        
        $statusKode = $request->query('status_kode');
        $statusKodeNot = $request->query('status_kode_not');

        $query = \App\Models\PenerimaanBarang::with([
                'statusTransaksi', 'creator', 'laboran.user',
                'transaksi.barang.satuan', 'transaksi.barang.kategori', 'transaksi.barang.sifatBahan',
                'transaksi.batchBarang.penyedia', 'transaksi.dieksekusiOleh'
            ])
            ->orderBy('created_at', 'desc');

        if (!$isKoordinator && $isPetugas) {
            $query->where('created_by', $user->id);
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
        if (!$request->user()->hasRole('Petugas Gudang') && !$request->user()->hasRole('Koordinator Gudang')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Field header (berlaku untuk semua barang dalam 1 penerimaan).
        $request->validate([
            'tanggal' => 'required|date',
            'penyedia_id' => 'required|exists:penyedia,id',
            'jenis_kegiatan_id' => 'required|exists:jenis_kegiatan,id',
            'laboran_id' => 'nullable|exists:laboran,id',
            'link_pengadaan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|numeric|min:0.001',
            'items.*.harga_total' => 'required|numeric|min:0',
            'items.*.kondisi' => 'nullable|string',
            'items.*.tgl_kadaluarsa' => 'nullable|date',
            'items.*.status_kadaluarsa' => 'nullable|in:Terisi,TidakDicantumkan,BelumDiinput',
            'items.*.no_po' => 'nullable|string',
        ]);

        // Validasi bersyarat:
        // - Jenis kegiatan (header) ber-wajib_link_pengadaan -> link wajib.
        // - Barang ber-FEFO (perlu_kadaluarsa) wajib pilih status kadaluarsa;
        //   bila status 'Terisi' maka tanggal wajib diisi.
        $jk = \App\Models\JenisKegiatan::find($request->jenis_kegiatan_id);
        $fefoBarang = \App\Models\Barang::whereIn('id', collect($request->items)->pluck('barang_id'))
            ->where('perlu_kadaluarsa', true)
            ->pluck('nama_barang', 'id');

        $validator = \Illuminate\Support\Facades\Validator::make([], []);
        if ($jk && $jk->wajib_link_pengadaan && empty($request->link_pengadaan)) {
            $validator->errors()->add('link_pengadaan',
                "Link pengadaan wajib diisi untuk kegiatan {$jk->nama}.");
        }
        foreach ($request->items as $i => $item) {
            if ($fefoBarang->has($item['barang_id'])) {
                $sk = $item['status_kadaluarsa'] ?? null;
                if (!$sk) {
                    $validator->errors()->add("items.$i.status_kadaluarsa",
                        "Status kadaluarsa wajib dipilih untuk barang berkadaluarsa: {$fefoBarang[$item['barang_id']]}.");
                } elseif ($sk === 'Terisi' && empty($item['tgl_kadaluarsa'])) {
                    $validator->errors()->add("items.$i.tgl_kadaluarsa",
                        "Tanggal kadaluarsa wajib diisi karena status dipilih 'Terisi'.");
                }
            }
        }
        if ($validator->errors()->isNotEmpty()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        DB::beginTransaction();
        try {
            $createdItems = [];
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BM-PENDING')->first();

            foreach ($request->items as $item) {
                $jumlah = (float) $item['jumlah'];
                $hargaTotal = (float) $item['harga_total'];
                // Kolom 14: Harga Satuan = Harga Total Dibayar / Jumlah Masuk (AUTO).
                $hargaSatuan = $jumlah > 0 ? round($hargaTotal / $jumlah, 2) : 0;

                // Kolom 15: status & tanggal kadaluarsa hanya untuk barang ber-FEFO.
                $isFefo = $fefoBarang->has($item['barang_id']);
                $statusKad = $isFefo ? ($item['status_kadaluarsa'] ?? null) : null;
                $tglKad = ($statusKad === 'Terisi') ? ($item['tgl_kadaluarsa'] ?? null) : null;

                $transactionIdStr = 'TRX-BM-' . date('YmdHis') . '-' . rand(100, 999);

                // Buat Batch dengan status Pending (akan aktif saat verifikasi).
                // Nomor batch: B + urutan per barang (kolom 13, immutable).
                $batch = BatchBarang::create([
                    'barang_id' => $item['barang_id'],
                    'kode_batch' => BatchBarang::generateKodeBatch($item['barang_id']),
                    'tgl_penerimaan' => $request->tanggal,
                    'tgl_kadaluarsa' => $tglKad,
                    'status_kadaluarsa' => $statusKad,
                    'jumlah_awal' => $jumlah,
                    'stok_tersisa' => 0,
                    'kondisi' => $item['kondisi'] ?? 'Baik',
                    'no_po' => $item['no_po'] ?? null,
                    'penyedia_id' => $request->penyedia_id,
                    'harga_satuan' => $hargaSatuan,
                    'status_batch' => 'Pending'
                ]);

                // Buat Transaksi (Ledger)
                $transaksi = \App\Models\Transaksi::create([
                    'transaction_id' => $transactionIdStr,
                    'jenis' => 'Masuk',
                    'barang_id' => $item['barang_id'],
                    'batch_barang_id' => $batch->id,
                    'jumlah' => $jumlah,
                    'stok_sebelum' => 0, // Akan diupdate saat verifikasi
                    'stok_sesudah' => 0, // Akan diupdate saat verifikasi
                    'pengaju_id' => null,
                    'disetujui_oleh' => null,
                    'dieksekusi_oleh' => $request->user()->id, // Petugas yang input form
                    'keperluan' => $request->keperluan ?? null,
                    'tanda_terima' => false
                ]);

                // Buat Header Penerimaan Barang
                $penerimaan = \App\Models\PenerimaanBarang::create([
                    'transaksi_id' => $transaksi->id,
                    'harga_total' => $hargaTotal,
                    'harga_satuan' => $hargaSatuan,
                    'laboran_id' => $request->laboran_id,
                    'jenis_kegiatan' => $jk?->nama, // string disimpan utk kompatibilitas
                    'jenis_kegiatan_id' => $request->jenis_kegiatan_id,
                    'link_pengadaan' => $request->link_pengadaan,
                    'kode_status_transaksi' => $statusPending->kode,
                    'sumber_input' => 'web',
                    'created_by' => $request->user()->id,
                ]);

                $createdItems[] = $penerimaan;
            }

            DB::commit();

            // Notifikasi ke Koordinator Gudang (email + WhatsApp)
            $koordinators = User::whereHas('roles', function($q) {
                $q->where('name', 'Koordinator Gudang');
            })->get();

            $title = "Penerimaan Barang Baru";
            $body = "Ada penerimaan barang baru yang diinput oleh " . $request->user()->name . ".\nHarap segera diperiksa dan diverifikasi melalui sistem Lab Inventory Hub.";

            $this->notifier->notifyUsers($koordinators, $title, $body);

            return response()->json(['message' => 'Penerimaan barang berhasil dicatat dan menunggu verifikasi.', 'data' => $createdItems]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function verify(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak',
            'jumlah_diterima' => 'nullable|numeric|min:0.001',
            'catatan' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $penerimaan = \App\Models\PenerimaanBarang::findOrFail($id);
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BM-PENDING')->first();
            
            if ($penerimaan->kode_status_transaksi !== $statusPending->kode) {
                return response()->json(['message' => 'Transaksi sudah diproses.'], 400);
            }

            $kodeStatus = $request->status === 'Disetujui' ? 'BM-DISETUJUI' : 'BM-DITOLAK';
            $statusUpdate = \App\Models\StatusTransaksi::where('kode', $kodeStatus)->first();
            
            $penerimaan->kode_status_transaksi = $statusUpdate->kode;
            $penerimaan->updated_by = $request->user()->id;
            if ($request->filled('catatan')) {
                $penerimaan->catatan = $request->catatan;
            }
            $penerimaan->save();

            if ($request->status === 'Disetujui') {
                // Find related transaction
                $transaksi = $penerimaan->transaksi;
                if ($transaksi) {
                    // Koordinator boleh mengoreksi jumlah agar sesuai fisik yang
                    // benar-benar diterima (mis. ada yang pecah/kurang kirim).
                    $jumlahFinal = (float) $transaksi->jumlah;
                    if ($request->filled('jumlah_diterima')
                        && (float) $request->jumlah_diterima !== (float) $transaksi->jumlah) {
                        $jumlahAsli = $transaksi->jumlah;
                        $jumlahFinal = (float) $request->jumlah_diterima;
                        $alasan = "Jumlah dikoreksi saat verifikasi dari {$jumlahAsli} menjadi {$jumlahFinal}";
                        if ($request->filled('catatan')) {
                            $alasan .= ". Alasan: {$request->catatan}";
                        }
                        $transaksi->alasan_override = $alasan;
                        $transaksi->jumlah = $jumlahFinal;
                    }

                    $transaksi->stok_sebelum = \App\Models\Barang::find($transaksi->barang_id)->total_stok ?? 0;
                    $transaksi->stok_sesudah = $transaksi->stok_sebelum + $jumlahFinal;
                    $transaksi->disetujui_oleh = $request->user()->id;
                    $transaksi->save();

                    // Update Batch (ikut jumlah terverifikasi)
                    if ($transaksi->batch_barang_id) {
                        $batch = \App\Models\BatchBarang::find($transaksi->batch_barang_id);
                        if ($batch) {
                            $batch->jumlah_awal = $jumlahFinal;
                            $batch->stok_tersisa = $jumlahFinal;
                            $batch->status_batch = 'Aktif';
                            $batch->save();
                        }
                    }

                    // Update Master Barang
                    $master = \App\Models\Barang::find($transaksi->barang_id);
                    if ($master) {
                        $master->total_stok += $jumlahFinal;
                        $master->save();
                    }
                }
            } else {
                // Ditolak: tandai batch pending agar tidak menjadi batch yatim
                // dan tidak ikut terhitung sebagai stok.
                $transaksi = $penerimaan->transaksi;
                if ($transaksi && $transaksi->batch_barang_id) {
                    $batch = \App\Models\BatchBarang::find($transaksi->batch_barang_id);
                    if ($batch && $batch->status_batch === 'Pending') {
                        $batch->status_batch = 'Ditolak';
                        $batch->save();
                    }
                }
            }

            DB::commit();

            // Notifikasi hasil verifikasi ke Petugas Gudang (pembuat) — email + WhatsApp
            $petugas = User::find($penerimaan->created_by);
            if ($petugas) {
                $title = "Hasil Verifikasi Penerimaan Barang";
                $master = \App\Models\Barang::find($penerimaan->transaksi->barang_id);
                $namaBarang = $master ? $master->nama_barang : 'Barang';

                $body = "Data penerimaan barang yang Anda input (Barang: {$namaBarang}, Jumlah: {$penerimaan->transaksi->jumlah})\nStatus Verifikasi: {$request->status}\n";

                if ($request->status === 'Disetujui') {
                    $body .= "\nStok sudah berhasil ditambahkan ke inventaris utama.";
                }

                $this->notifier->notifyUsers($petugas, $title, $body);
            }

            return response()->json(['message' => 'Verifikasi penerimaan berhasil disimpan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }
}
