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
        // Delete detail_transaksi that belonged to 'Masuk' transactions
        // which are not in pengeluaran_barang table
        DB::statement('DELETE FROM detail_transaksi WHERE transaksi_id NOT IN (SELECT id FROM pengeluaran_barang)');

        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->dropForeign(['transaksi_id']);
            $table->renameColumn('transaksi_id', 'pengeluaran_barang_id');
            $table->foreign('pengeluaran_barang_id')->references('id')->on('pengeluaran_barang')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->dropForeign(['pengeluaran_barang_id']);
            $table->renameColumn('pengeluaran_barang_id', 'transaksi_id');
            // Can't easily restore the old foreign key if 'transaksi' table doesn't exist anymore, 
            // but we add it back just in case the rollback order is correct.
            $table->foreign('transaksi_id')->references('id')->on('transaksi')->onDelete('cascade');
        });
    }
};
