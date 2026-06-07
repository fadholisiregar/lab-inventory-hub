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
        Schema::table('transaksi', function (Blueprint $table) {
            $table->foreignId('ruang_laboratorium_id')->nullable()->constrained('ruang_laboratorium')->nullOnDelete();
            $table->string('jenis_kegiatan')->nullable();
            $table->string('judul_kegiatan')->nullable();
            $table->string('prodi_mitra')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->dropForeign(['ruang_laboratorium_id']);
            $table->dropColumn(['ruang_laboratorium_id', 'jenis_kegiatan', 'judul_kegiatan', 'prodi_mitra']);
        });
    }
};
