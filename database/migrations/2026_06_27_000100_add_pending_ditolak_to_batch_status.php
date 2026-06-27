<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Batch dibuat dengan status 'Pending' saat penerimaan diinput, lalu menjadi
     * 'Aktif' bila disetujui atau 'Ditolak' bila ditolak Koordinator. CHECK
     * constraint lama hanya mengizinkan Aktif/Habis/Kadaluarsa sehingga insert
     * status 'Pending' selalu gagal — perluas daftar nilai yang diizinkan.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE batch_barang DROP CONSTRAINT IF EXISTS batch_barang_status_batch_check');
        DB::statement("ALTER TABLE batch_barang ADD CONSTRAINT batch_barang_status_batch_check CHECK (status_batch::text = ANY (ARRAY['Pending','Aktif','Habis','Kadaluarsa','Ditolak']::text[]))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE batch_barang DROP CONSTRAINT IF EXISTS batch_barang_status_batch_check');
        DB::statement("ALTER TABLE batch_barang ADD CONSTRAINT batch_barang_status_batch_check CHECK (status_batch::text = ANY (ARRAY['Aktif','Habis','Kadaluarsa']::text[]))");
    }
};
