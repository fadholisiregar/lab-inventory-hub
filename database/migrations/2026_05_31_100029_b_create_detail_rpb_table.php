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
        Schema::create('detail_rpb', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rpb_id')->constrained('rencana_pengambilan_bahan')->onDelete('cascade');
            $table->foreignId('master_barang_id')->constrained('master_barang')->onDelete('cascade');
            $table->integer('jumlah_diminta');
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
        Schema::dropIfExists('detail_rpb');
    }
};
