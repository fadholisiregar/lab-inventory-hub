<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Master Periode Akademik: 1 baris = Tahun Ajaran + Semester (Ganjil/Genap),
     * dengan rentang tanggal & penanda aktif. Dipakai menandai Rencana Kebutuhan
     * per semester & membatasi laporan realisasi.
     */
    public function up(): void
    {
        Schema::create('periode_akademik', function (Blueprint $table) {
            $table->id();
            $table->string('tahun_ajaran');           // mis. 2025/2026
            $table->string('semester');               // Ganjil | Genap
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();
            $table->boolean('is_aktif')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['tahun_ajaran', 'semester']);
        });

        Schema::table('rencana_kebutuhan', function (Blueprint $table) {
            $table->foreignId('periode_akademik_id')->nullable()->after('modul_praktikum_id')
                ->constrained('periode_akademik')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('rencana_kebutuhan', function (Blueprint $table) {
            $table->dropConstrainedForeignId('periode_akademik_id');
        });
        Schema::dropIfExists('periode_akademik');
    }
};
