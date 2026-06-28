<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom `catatan` dipakai oleh import XLSX (keterangan) & fitur koreksi
     * saat verifikasi, tapi belum pernah dibuat -> insert gagal (42703).
     */
    public function up(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->text('catatan')->nullable()->after('link_pengadaan');
        });
    }

    public function down(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropColumn('catatan');
        });
    }
};
