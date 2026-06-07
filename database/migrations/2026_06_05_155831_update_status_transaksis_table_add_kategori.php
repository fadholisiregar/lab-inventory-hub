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
        Schema::table('status_transaksi', function (Blueprint $table) {
            $table->enum('kategori', ['Masuk', 'Keluar'])->after('id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('status_transaksi', function (Blueprint $table) {
            $table->dropColumn('kategori');
        });
    }
};
