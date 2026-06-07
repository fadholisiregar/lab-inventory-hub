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
        Schema::create('batch_barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_barang_id')->constrained('master_barang')->onDelete('cascade');
            $table->string('kode_batch');
            $table->string('no_lot_supplier')->nullable();
            $table->date('tgl_penerimaan');
            $table->date('tgl_produksi')->nullable();
            $table->date('tgl_kadaluarsa')->nullable();
            $table->integer('jumlah_awal');
            $table->integer('stok_tersisa');
            $table->string('kondisi');
            $table->string('no_po')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->onDelete('set null');
            $table->decimal('harga_satuan', 15, 2)->nullable();
            $table->enum('status_batch', ['Aktif', 'Habis', 'Kadaluarsa'])->default('Aktif');
            $table->string('lokasi_fisik')->nullable();
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
        Schema::dropIfExists('batch_barang');
    }
};
