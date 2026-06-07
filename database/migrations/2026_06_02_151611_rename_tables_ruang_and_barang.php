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
        Schema::rename('ruang_laboratoria', 'ruang_laboratorium');
        Schema::rename('master_barang', 'barang');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('ruang_laboratorium', 'ruang_laboratoria');
        Schema::rename('barang', 'master_barang');
    }
};
