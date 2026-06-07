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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->enum('jenis', ['Masuk', 'Keluar']);
            $table->dateTime('tanggal_waktu');
            $table->foreignId('pengaju_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('dieksekusi_oleh')->nullable()->constrained('users')->onDelete('set null');
            $table->text('keperluan')->nullable();
            $table->foreignId('referensi_rpb_id')->nullable()->constrained('rencana_pengambilan_bahan')->onDelete('set null');
            $table->boolean('tanda_terima')->default(false);
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
        Schema::dropIfExists('transaksi');
    }
};
