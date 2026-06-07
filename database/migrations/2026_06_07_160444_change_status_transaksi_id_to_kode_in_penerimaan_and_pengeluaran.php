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
            $table->dropForeign(['status_transaksi_id']);
            $table->dropColumn('status_transaksi_id');
            $table->string('kode_status_transaksi')->nullable();
            $table->foreign('kode_status_transaksi')->references('kode')->on('status_transaksi')->nullOnDelete()->cascadeOnUpdate();
        });

        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['status_transaksi_id']);
            $table->dropColumn('status_transaksi_id');
            $table->string('kode_status_transaksi')->nullable();
            $table->foreign('kode_status_transaksi')->references('kode')->on('status_transaksi')->nullOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropForeign(['kode_status_transaksi']);
            $table->dropColumn('kode_status_transaksi');
            $table->foreignId('status_transaksi_id')->nullable()->constrained('status_transaksi')->nullOnDelete();
        });

        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['kode_status_transaksi']);
            $table->dropColumn('kode_status_transaksi');
            $table->foreignId('status_transaksi_id')->nullable()->constrained('status_transaksi')->nullOnDelete();
        });
    }
};
