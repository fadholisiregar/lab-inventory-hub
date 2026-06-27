<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * - jenis_kegiatan_id: referensi ke master jenis_kegiatan (menggantikan
     *   kolom string `jenis_kegiatan` secara bertahap; string lama dibiarkan
     *   dulu untuk kompatibilitas kode existing).
     * - sumber_input: jalur input (web|csv) untuk audit-gap kolom 10
     *   (Petugas Gudang web = auto login, csv = manual).
     */
    public function up(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->foreignId('jenis_kegiatan_id')->nullable()->after('jenis_kegiatan')
                ->constrained('jenis_kegiatan')->nullOnDelete();
            $table->string('sumber_input')->default('web')->after('catatan');
        });

        // Backfill bila ada data lama yang namanya cocok dengan master.
        DB::statement("UPDATE penerimaan_barang p SET jenis_kegiatan_id = jk.id
                       FROM jenis_kegiatan jk
                       WHERE lower(p.jenis_kegiatan) = lower(jk.nama)");
    }

    public function down(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropConstrainedForeignId('jenis_kegiatan_id');
            $table->dropColumn('sumber_input');
        });
    }
};
