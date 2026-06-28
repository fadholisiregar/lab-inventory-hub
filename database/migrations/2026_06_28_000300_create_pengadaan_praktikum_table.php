<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pengadaan Bahan Praktikum — usulan pengadaan oleh Laboran (barang yang
     * stoknya tidak cukup), lengkap dengan harga penawaran & penyedia.
     */
    public function up(): void
    {
        Schema::create('pengadaan_praktikum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studi');
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah');
            $table->foreignId('modul_praktikum_id')->constrained('modul_praktikum');
            $table->foreignId('barang_id')->constrained('barang');
            $table->decimal('jumlah', 12, 2);
            $table->decimal('harga_penawaran', 15, 2)->nullable();
            $table->foreignId('penyedia_id')->nullable()->constrained('penyedia')->nullOnDelete();
            $table->string('status')->default('Diajukan'); // Diajukan | Disetujui | Ditolak | Selesai
            $table->text('tindak_lanjut')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengadaan_praktikum');
    }
};
