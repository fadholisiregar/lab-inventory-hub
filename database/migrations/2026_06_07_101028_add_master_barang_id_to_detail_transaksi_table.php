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
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->foreignId('master_barang_id')->nullable()->after('pengeluaran_barang_id')->constrained('barang')->nullOnDelete();
        });

        // Make batch_barang_id nullable (it will be assigned during execute phase)
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->foreignId('batch_barang_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            $table->dropForeign(['master_barang_id']);
            $table->dropColumn('master_barang_id');
        });
    }
};
