<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penanda FEFO seharusnya berupa flag boolean di master barang,
     * bukan sebuah tanggal (tanggal kadaluarsa yang sebenarnya hidup per-batch).
     */
    public function up(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->boolean('perlu_kadaluarsa')->default(false)->after('sifat_bahan');
        });

        // Barang yang sebelumnya punya tanggal kadaluarsa dianggap barang ber-FEFO.
        DB::statement('UPDATE barang SET perlu_kadaluarsa = true WHERE tanggal_kadaluarsa IS NOT NULL');

        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('tanggal_kadaluarsa');
        });
    }

    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->date('tanggal_kadaluarsa')->nullable()->after('sifat_bahan');
        });

        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('perlu_kadaluarsa');
        });
    }
};
