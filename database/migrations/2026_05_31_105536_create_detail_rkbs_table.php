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
        Schema::create('detail_rkbs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_kebutuhan_barang_id')->constrained('rencana_kebutuhan_barangs')->cascadeOnDelete();
            $table->foreignId('master_barang_id')->constrained('master_barang')->cascadeOnDelete();
            $table->enum('alasan_kebutuhan', ['Stok di Bawah Minimum', 'Mendekati Kadaluarsa']);
            $table->integer('jumlah_rekomendasi')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_rkbs');
    }
};
