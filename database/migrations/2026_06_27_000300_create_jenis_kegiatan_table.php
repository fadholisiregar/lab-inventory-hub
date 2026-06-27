<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master jenis kegiatan penerimaan barang (lookup) agar nilai bisa
     * dikelola admin tanpa migrasi. `wajib_link_pengadaan` mendukung aturan
     * kolom 11: Link Pengadaan wajib bila kegiatan = Pengadaan.
     */
    public function up(): void
    {
        Schema::create('jenis_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama')->unique();
            $table->boolean('wajib_link_pengadaan')->default(false);
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('jenis_kegiatan')->insert([
            ['nama' => 'Pengadaan',        'wajib_link_pengadaan' => true,  'aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Belanja Langsung', 'wajib_link_pengadaan' => false, 'aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Hibah',            'wajib_link_pengadaan' => false, 'aktif' => true, 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Sumbangan',        'wajib_link_pengadaan' => false, 'aktif' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_kegiatan');
    }
};
