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
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->foreignId('status_transaksi_id')->nullable()->constrained('status_transaksi')->nullOnDelete();
        });

        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->foreignId('status_transaksi_id')->nullable()->constrained('status_transaksi')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropForeign(['status_transaksi_id']);
            $table->dropColumn('status_transaksi_id');
        });

        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['status_transaksi_id']);
            $table->dropColumn('status_transaksi_id');
            $table->enum('status', ['Pending','Disetujui','Menunggu Konfirmasi','Selesai'])->default('Pending');
        });
    }
};
