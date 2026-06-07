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
        Schema::rename('admin_gudangs', 'admin_gudang');
        Schema::rename('kategori_rumpuns', 'kategori_rumpun');
        Schema::rename('kategoris', 'kategori');
        Schema::rename('koordinators', 'koordinator');
        Schema::rename('laborans', 'laboran');
        Schema::rename('satuans', 'satuan');
        Schema::rename('suppliers', 'supplier');
        Schema::rename('rencana_kebutuhan_barangs', 'rencana_kebutuhan_barang');
    }

    public function down(): void
    {
        Schema::rename('admin_gudang', 'admin_gudangs');
        Schema::rename('kategori_rumpun', 'kategori_rumpuns');
        Schema::rename('kategori', 'kategoris');
        Schema::rename('koordinator', 'koordinators');
        Schema::rename('laboran', 'laborans');
        Schema::rename('satuan', 'satuans');
        Schema::rename('supplier', 'suppliers');
        Schema::rename('rencana_kebutuhan_barang', 'rencana_kebutuhan_barangs');
    }
};
