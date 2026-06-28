<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Restrukturisasi modul Perencanaan dari flat -> header/detail.
     * Header = 1 rencana per (prodi, matkul, modul) + status (Draft/Diajukan/Selesai).
     * Detail = daftar bahan; item yang stoknya kurang membawa field pengadaan
     * (harga_penawaran, penyedia, status_pengadaan) -> "Pengadaan dari Kebutuhan".
     */
    public function up(): void
    {
        Schema::dropIfExists('pengadaan_praktikum');
        Schema::dropIfExists('kebutuhan_praktikum');

        Schema::create('rencana_kebutuhan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_studi_id')->constrained('program_studi');
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah');
            $table->foreignId('modul_praktikum_id')->constrained('modul_praktikum');
            $table->string('status')->default('Draft'); // Draft | Diajukan | Selesai
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('rencana_kebutuhan_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_kebutuhan_id')->constrained('rencana_kebutuhan')->cascadeOnDelete();
            $table->foreignId('barang_id')->constrained('barang');
            $table->decimal('jumlah_pengajuan', 12, 2);
            $table->decimal('stok_saat_pengajuan', 12, 2)->nullable();
            $table->string('status_item')->nullable(); // Cukup | Perlu Pengadaan
            // Diisi pada tahap Pengadaan (hanya untuk item yang stoknya kurang)
            $table->decimal('harga_penawaran', 15, 2)->nullable();
            $table->foreignId('penyedia_id')->nullable()->constrained('penyedia')->nullOnDelete();
            $table->string('status_pengadaan')->nullable(); // Diajukan | Disetujui | Ditolak | Selesai
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_kebutuhan_item');
        Schema::dropIfExists('rencana_kebutuhan');
    }
};
