<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * GHS (kolom 16) adalah sifat jenis barang, bukan data per-penerimaan.
     * Master GHS diwakili tabel sifat_bahan dengan tambahan kode_ghs sehingga
     * label bahaya = "nama (kode_ghs)", mis. "Mudah Terbakar (GHS02)".
     */
    public function up(): void
    {
        Schema::table('sifat_bahan', function (Blueprint $table) {
            $table->string('kode_ghs')->nullable()->after('nama');
        });

        // Backfill kode GHS untuk data sifat_bahan yang sudah ada.
        $map = [
            'Mudah Meledak (Explosive)'   => 'GHS01',
            'Mudah Terbakar (Flammable)'  => 'GHS02',
            'Oksidator (Oxidizing)'       => 'GHS03',
            'Korosif (Corrosive)'         => 'GHS05',
            'Beracun (Toxic)'             => 'GHS06',
            'Iritan (Irritant)'           => 'GHS07',
            'Bahaya Lingkungan'           => 'GHS09',
            // Radioaktif: tidak punya piktogram GHS standar -> dibiarkan null.
        ];
        foreach ($map as $nama => $kode) {
            DB::table('sifat_bahan')->where('nama', $nama)->update(['kode_ghs' => $kode]);
        }
    }

    public function down(): void
    {
        Schema::table('sifat_bahan', function (Blueprint $table) {
            $table->dropColumn('kode_ghs');
        });
    }
};
