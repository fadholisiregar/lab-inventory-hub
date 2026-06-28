<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kebutuhan Bahan Praktikum — perencanaan kebutuhan bahan oleh Laboran.
     * Status dihitung dari ketersediaan stok saat input:
     *  - 'Cukup'          : stok >= jumlah pengajuan (lanjut Permintaan Bahan)
     *  - 'Perlu Pengadaan': stok < jumlah pengajuan (lanjut Ajukan Pengadaan)
     */
    public function up(): void
    {
        Schema::create('kebutuhan_praktikum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studi');
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah');
            $table->foreignId('modul_praktikum_id')->constrained('modul_praktikum');
            $table->foreignId('barang_id')->constrained('barang');
            $table->decimal('jumlah_pengajuan', 12, 2);
            $table->decimal('stok_saat_pengajuan', 12, 2)->nullable();
            $table->string('status')->nullable(); // Cukup | Perlu Pengadaan
            $table->text('tindak_lanjut')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kebutuhan_praktikum');
    }
};
