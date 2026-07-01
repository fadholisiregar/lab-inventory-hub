<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * FK ke mata kuliah, hanya terisi untuk Jenis Kegiatan = Praktikum
     * (null untuk non-praktikum). Dipakai untuk membandingkan barang keluar
     * vs perencanaan praktikum secara deterministik. judul_kegiatan tetap
     * menyimpan nama matkul sebagai snapshot tampilan.
     */
    public function up(): void
    {
        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->foreignId('mata_kuliah_id')->nullable()->after('program_studi_id')
                ->constrained('mata_kuliah')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['mata_kuliah_id']);
            $table->dropColumn('mata_kuliah_id');
        });
    }
};
