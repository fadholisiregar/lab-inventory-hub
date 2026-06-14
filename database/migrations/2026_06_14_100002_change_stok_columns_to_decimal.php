<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // batch_barang: jumlah_awal & stok_tersisa integer → decimal(10,2)
        DB::statement('ALTER TABLE "batch_barang" ALTER COLUMN "jumlah_awal" TYPE DECIMAL(10,2) USING "jumlah_awal"::DECIMAL(10,2)');
        DB::statement('ALTER TABLE "batch_barang" ALTER COLUMN "stok_tersisa" TYPE DECIMAL(10,2) USING "stok_tersisa"::DECIMAL(10,2)');

        // barang: total_stok & stok_minimum integer → decimal(10,2)
        DB::statement('ALTER TABLE "barang" ALTER COLUMN "total_stok" TYPE DECIMAL(10,2) USING "total_stok"::DECIMAL(10,2)');
        DB::statement('ALTER TABLE "barang" ALTER COLUMN "stok_minimum" TYPE DECIMAL(10,2) USING "stok_minimum"::DECIMAL(10,2)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE "batch_barang" ALTER COLUMN "jumlah_awal" TYPE INTEGER USING ROUND("jumlah_awal")::INTEGER');
        DB::statement('ALTER TABLE "batch_barang" ALTER COLUMN "stok_tersisa" TYPE INTEGER USING ROUND("stok_tersisa")::INTEGER');
        DB::statement('ALTER TABLE "barang" ALTER COLUMN "total_stok" TYPE INTEGER USING ROUND("total_stok")::INTEGER');
        DB::statement('ALTER TABLE "barang" ALTER COLUMN "stok_minimum" TYPE INTEGER USING ROUND("stok_minimum")::INTEGER');
    }
};
