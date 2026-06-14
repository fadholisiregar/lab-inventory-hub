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
        Schema::create('sifat_bahan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('warna')->default('slate'); // slate, red, orange, yellow, dll
            $table->timestamps();
        });

        Schema::create('barang_sifat_bahan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->foreignId('sifat_bahan_id')->constrained('sifat_bahan')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('sifat_bahan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->string('sifat_bahan')->nullable();
        });
        Schema::dropIfExists('barang_sifat_bahan');
        Schema::dropIfExists('sifat_bahan');
    }
};
