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
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('perlu_kadaluarsa');
            $table->date('tanggal_kadaluarsa')->nullable()->after('sifat_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('tanggal_kadaluarsa');
            $table->boolean('perlu_kadaluarsa')->default(false)->after('sifat_bahan');
        });
    }
};
