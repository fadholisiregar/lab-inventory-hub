<?php

namespace App\Services;

use App\Models\BatchBarang;
use App\Models\DetailTransaksi;
use App\Models\RencanaPengambilanBahan;
use App\Models\Transaksi;
use Exception;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    /**
     * Process outbound transaction based on approved RPB using FEFO algorithm.
     *
     * @param int $rpbId
     * @param int $eksekutorId
     * @return Transaksi
     * @throws Exception
     */
    public function processOutboundTransaction($rpbId, $eksekutorId)
    {
        return DB::transaction(function () use ($rpbId, $eksekutorId) {
            // 1. Validasi RPB
            $rpb = RencanaPengambilanBahan::with('detailRpb')->findOrFail($rpbId);

            if ($rpb->status !== 'approved') {
                throw new Exception("RPB ini belum disetujui atau sudah ditolak.");
            }

            // (Opsional) Cek apakah RPB ini sudah pernah diproses sebelumnya
            $existingTransaksi = Transaksi::where('referensi_rpb_id', $rpbId)->exists();
            if ($existingTransaksi) {
                throw new Exception("RPB ini sudah diproses transaksinya.");
            }

            // 2. Buat record Transaksi Utama
            $transaksi = Transaksi::create([
                'jenis' => 'Keluar',
                'tanggal_waktu' => now(),
                'pengaju_id' => $rpb->laboran_id,
                'disetujui_oleh' => $rpb->koordinator_id,
                'dieksekusi_oleh' => $eksekutorId,
                'keperluan' => "Pengambilan bahan untuk " . $rpb->jadwal_praktikum,
                'referensi_rpb_id' => $rpbId,
                'tanda_terima' => false,
            ]);

            // 3. Proses setiap detail barang yang diminta (FEFO Logic)
            foreach ($rpb->detailRpb as $detail) {
                $jumlahDiminta = $detail->jumlah_diminta;
                $barangId = $detail->barang_id;

                // Ambil semua batch aktif yang masih ada stok, urutkan berdasarkan tgl kadaluarsa terdekat (FEFO)
                // Menggunakan lockForUpdate() untuk mencegah race condition antar transaksi bersamaan
                $batches = BatchBarang::where('barang_id', $barangId)
                    ->where('stok_tersisa', '>', 0)
                    ->where('status_batch', 'Aktif')
                    ->orderByRaw("tgl_kadaluarsa IS NULL, tgl_kadaluarsa ASC") // Jika tgl null, taruh belakang. Jika ada tgl, urutkan ASC
                    ->lockForUpdate()
                    ->get();

                foreach ($batches as $batch) {
                    if ($jumlahDiminta <= 0) {
                        break;
                    }

                    // Tentukan berapa banyak yang bisa diambil dari batch ini
                    $stokTersedia = $batch->stok_tersisa;
                    $jumlahDiambil = min($jumlahDiminta, $stokTersedia);

                    // Buat detail transaksi historis pemotongan
                    DetailTransaksi::create([
                        'transaksi_id' => $transaksi->id,
                        'batch_barang_id' => $batch->id,
                        'jumlah' => $jumlahDiambil,
                        'stok_sebelum' => $stokTersedia,
                        'stok_sesudah' => $stokTersedia - $jumlahDiambil,
                    ]);

                    // Update stok pada batch
                    $batch->stok_tersisa -= $jumlahDiambil;
                    
                    if ($batch->stok_tersisa == 0) {
                        $batch->status_batch = 'Habis';
                    }
                    $batch->save();

                    // Kurangi permintaan
                    $jumlahDiminta -= $jumlahDiambil;
                }

                // Jika setelah looping batch ternyata jumlah masih kurang, artinya stok fisik kurang
                if ($jumlahDiminta > 0) {
                    $namaBarang = $detail->masterBarang->nama_barang ?? 'Barang ID: ' . $masterBarangId;
                    throw new Exception("Stok tidak mencukupi untuk barang {$namaBarang}. Kurang: {$jumlahDiminta} lagi.");
                }
            }

            return $transaksi;
        });
    }
}
