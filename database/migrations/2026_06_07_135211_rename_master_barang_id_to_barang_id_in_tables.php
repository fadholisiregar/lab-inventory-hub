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
        $tables = [
            'penerimaan_barang',
            'pengeluaran_barang',
            'detail_transaksi_pengeluaran',
            'batch_barang',
            'detail_rkbs',
            'detail_rpb'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasColumn($tableName, 'master_barang_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->dropForeign([trim('master_barang_id')]);
                    $table->renameColumn('master_barang_id', 'barang_id');
                    
                    // The original constraints were sometimes referencing master_barang and sometimes barang.
                    // But now the table is named 'barang'.
                    // Pengeluaran and DetailTransaksi had nullable
                    if ($tableName === 'pengeluaran_barang' || $tableName === 'detail_transaksi_pengeluaran') {
                        $table->foreign('barang_id')->references('id')->on('barang')->nullOnDelete();
                    } else {
                        $table->foreign('barang_id')->references('id')->on('barang')->cascadeOnDelete();
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'penerimaan_barang',
            'pengeluaran_barang',
            'detail_transaksi_pengeluaran',
            'batch_barang',
            'detail_rkbs',
            'detail_rpb'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasColumn($tableName, 'barang_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->dropForeign([trim('barang_id')]);
                    $table->renameColumn('barang_id', 'master_barang_id');
                    
                    if ($tableName === 'pengeluaran_barang' || $tableName === 'detail_transaksi_pengeluaran') {
                        $table->foreign('master_barang_id')->references('id')->on('barang')->nullOnDelete();
                    } else {
                        $table->foreign('master_barang_id')->references('id')->on('barang')->cascadeOnDelete();
                    }
                });
            }
        }
    }
};
