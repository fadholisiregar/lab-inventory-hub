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
    public function index(Request $request)
    {
        $user = $request->user();
        
        $isKoordinator = $user->hasRole('Koordinator Gudang') || $user->hasRole('Koordinator');
        $isPetugas = $user->hasRole('Petugas Gudang');
        
        $statusKode = $request->query('status_kode');
        $statusKodeNot = $request->query('status_kode_not');

        $query = \App\Models\PenerimaanBarang::with(['statusTransaksi', 'creator', 'laboran.user', 'transaksi.barang.satuan', 'transaksi.barang.kategori', 'transaksi.dieksekusiOleh'])
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

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.kondisi' => 'required|string',
            'items.*.tgl_kadaluarsa' => 'nullable|date',
            'items.*.no_po' => 'nullable|string',
            'petugas_gudang_id' => 'required|exists:petugas_gudang,id'
        ]);

        DB::beginTransaction();
        try {
            $createdItems = [];
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BM-PENDING')->first();

            foreach ($request->items as $item) {
                // Buat unique transaction_id per form submission atau per item?
                // Karena kita loop items, dan 1 transaksi = 1 item
                $transactionIdStr = 'TRX-BM-' . date('YmdHis') . '-' . rand(100, 999);

                // Buat Batch dengan status Pending (akan aktif saat verifikasi)
                $batch = BatchBarang::create([
                    'barang_id' => $item['barang_id'],
                    'kode_batch' => 'BATCH-' . date('Ymd') . '-' . rand(1000, 9999),
                    'tgl_penerimaan' => now(),
                    'tgl_kadaluarsa' => $item['tgl_kadaluarsa'] ?? null,
                    'jumlah_awal' => $item['jumlah'],
                    'stok_tersisa' => 0,
                    'kondisi' => $item['kondisi'] ?? 'Baik',
                    'no_po' => $request->keperluan ?? null,
                    'status_batch' => 'Pending'
                ]);

                // Buat Transaksi (Ledger)
                $transaksi = \App\Models\Transaksi::create([
                    'transaction_id' => $transactionIdStr,
                    'jenis' => 'Masuk',
                    'barang_id' => $item['barang_id'],
                    'batch_barang_id' => $batch->id,
                    'jumlah' => $item['jumlah'],
                    'stok_sebelum' => 0, // Akan diupdate saat verifikasi
                    'stok_sesudah' => 0, // Akan diupdate saat verifikasi
                    'pengaju_id' => null, // Untuk penerimaan, pengaju mungkin null atau admin
                    'disetujui_oleh' => null,
                    'dieksekusi_oleh' => $request->user()->id, // Petugas yang input form
                    'keperluan' => $request->keperluan ?? null,
                    'tanda_terima' => false
                ]);

                // Buat Header Penerimaan Barang
                $penerimaan = \App\Models\PenerimaanBarang::create([
                    'transaksi_id' => $transaksi->id,
                    'harga_sebelum_ppn' => $item['harga_sebelum_ppn'] ?? 0,
                    'harga_total' => $item['harga_total'] ?? 0,
                    'harga_satuan' => $item['harga_satuan'] ?? 0,
                    'laboran_id' => $item['laboran_id'] ?? null,
                    'jenis_kegiatan' => $item['jenis_kegiatan'] ?? null,
                    'link_pengadaan' => $item['link_pengadaan'] ?? null,
                    'kode_status_transaksi' => $statusPending->kode,
                    'created_by' => $request->user()->id,
                ]);
                
                $createdItems[] = $penerimaan;
            }

            DB::commit();

            try {
                // Notifikasi ke Koordinator Gudang
                $koordinators = User::whereHas('roles', function($q) {
                    $q->where('name', 'Koordinator Gudang');
                })->get();
                
                $title = "Penerimaan Barang Baru";
                $body = "Ada penerimaan barang baru yang diinput oleh " . $request->user()->name . ".\nHarap segera diperiksa dan diverifikasi melalui sistem Lab Inventory Hub.";
                
                foreach ($koordinators as $koor) {
                    if ($koor->email) {
                        Mail::to($koor->email)->send(new EmailNotification($title, $body));
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Gagal kirim email notifikasi penerimaan: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Penerimaan barang berhasil dicatat dan menunggu verifikasi.', 'data' => $createdItems]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function verify(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Disetujui,Ditolak'
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
            $penerimaan->save();

            if ($request->status === 'Disetujui') {
                // Find related transaction
                $transaksi = $penerimaan->transaksi;
                if ($transaksi) {
                    $transaksi->stok_sebelum = \App\Models\Barang::find($transaksi->barang_id)->total_stok ?? 0;
                    $transaksi->stok_sesudah = $transaksi->stok_sebelum + $transaksi->jumlah;
                    $transaksi->disetujui_oleh = $request->user()->id;
                    $transaksi->save();

                    // Update Batch
                    if ($transaksi->batch_barang_id) {
                        $batch = \App\Models\BatchBarang::find($transaksi->batch_barang_id);
                        if ($batch) {
                            $batch->stok_tersisa = $batch->jumlah_awal;
                            $batch->status_batch = 'Aktif';
                            $batch->save();
                        }
                    }

                    // Update Master Barang
                    $master = \App\Models\Barang::find($transaksi->barang_id);
                    if ($master) {
                        $master->total_stok += $transaksi->jumlah;
                        $master->save();
                    }
                }
            }

            DB::commit();

            try {
                // Notifikasi hasil verifikasi ke Petugas Gudang (pembuat)
                $petugas = User::find($penerimaan->created_by);
                if ($petugas && $petugas->email) {
                    $title = "Hasil Verifikasi Penerimaan Barang";
                    $master = \App\Models\Barang::find($penerimaan->transaksi->barang_id);
                    $namaBarang = $master ? $master->nama_barang : 'Barang';
                    
                    $body = "Data penerimaan barang yang Anda input (Barang: {$namaBarang}, Jumlah: {$penerimaan->transaksi->jumlah})\nStatus Verifikasi: {$request->status}\n";
                    
                    if ($request->status === 'Disetujui') {
                        $body .= "\nStok sudah berhasil ditambahkan ke inventaris utama.";
                    }
                    
                    Mail::to($petugas->email)->send(new EmailNotification($title, $body));
                }
            } catch (\Exception $e) {
                \Log::error('Gagal kirim email verifikasi penerimaan: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Verifikasi penerimaan berhasil disimpan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }
}
