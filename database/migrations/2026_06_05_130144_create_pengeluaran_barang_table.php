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
        Schema::create('pengeluaran_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_barang_id')->nullable()->constrained('barang');
            $table->enum('status', ['Pending','Disetujui','Menunggu Konfirmasi','Selesai']);
            $table->foreignId('petugas_gudang_id')->nullable()->constrained('petugas_gudang');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->foreignId('dieksekusi_oleh')->nullable()->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->foreignId('ruang_laboratorium_id')->nullable()->constrained('ruang_laboratorium');
            $table->string('jenis_kegiatan')->nullable();
            $table->string('judul_kegiatan')->nullable();
            $table->string('prodi_mitra')->nullable();
            $table->text('keperluan')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran_barang');
    }
};
