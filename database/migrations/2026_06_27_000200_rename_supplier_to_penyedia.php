<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Supplier bukan role/pengguna sistem, melainkan master pihak eksternal
     * penyedia barang (istilah pengadaan: "Penyedia"). Samakan penamaan tabel,
     * kolom FK, dan kolom terkait agar konsisten.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE batch_barang RENAME COLUMN supplier_id TO penyedia_id');
        DB::statement('ALTER TABLE batch_barang RENAME COLUMN no_lot_supplier TO no_lot_penyedia');
        DB::statement('ALTER TABLE supplier RENAME COLUMN kode_supplier TO kode_penyedia');
        DB::statement('ALTER TABLE supplier RENAME COLUMN nama_supplier TO nama_penyedia');
        DB::statement('ALTER TABLE supplier RENAME TO penyedia');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE penyedia RENAME TO supplier');
        DB::statement('ALTER TABLE supplier RENAME COLUMN nama_penyedia TO nama_supplier');
        DB::statement('ALTER TABLE supplier RENAME COLUMN kode_penyedia TO kode_supplier');
        DB::statement('ALTER TABLE batch_barang RENAME COLUMN no_lot_penyedia TO no_lot_supplier');
        DB::statement('ALTER TABLE batch_barang RENAME COLUMN penyedia_id TO supplier_id');
    }
};
