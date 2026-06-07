<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $transaksis = DB::table('transaksi')->get();
        foreach ($transaksis as $t) {
            if ($t->jenis === 'Masuk') {
                DB::table('penerimaan_barang')->insert([
                    'id' => $t->id,
                    'master_barang_id' => 1, // Fallback since we didn't have it directly in transaksi
                    'jumlah' => 1,
                    'petugas_gudang_id' => 1, // Fallback
                    'created_by' => $t->created_by ?? 1,
                    'updated_by' => $t->updated_by,
                    'created_at' => $t->created_at,
                    'updated_at' => $t->updated_at,
                ]);
            } else {
                DB::table('pengeluaran_barang')->insert([
                    'id' => $t->id,
                    'master_barang_id' => null, 
                    'status' => $t->status,
                    'petugas_gudang_id' => null,
                    'disetujui_oleh' => $t->disetujui_oleh,
                    'dieksekusi_oleh' => $t->dieksekusi_oleh,
                    'created_by' => $t->created_by ?? 1,
                    'updated_by' => $t->updated_by,
                    'ruang_laboratorium_id' => $t->ruang_laboratorium_id,
                    'jenis_kegiatan' => $t->jenis_kegiatan,
                    'judul_kegiatan' => $t->judul_kegiatan,
                    'prodi_mitra' => $t->prodi_mitra,
                    'keperluan' => $t->keperluan,
                    'created_at' => $t->created_at,
                    'updated_at' => $t->updated_at,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down migration logic for data since the tables will just be dropped in previous migrations
    }
};
