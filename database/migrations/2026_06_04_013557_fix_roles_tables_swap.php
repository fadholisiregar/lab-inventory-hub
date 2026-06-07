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
        // Swap koordinator and petugas_gudang tables back to their correct meanings
        
        // 1. Rename koordinator (which holds laboran_id) to temp_koordinator
        Schema::rename('koordinator', 'temp_koordinator');
        
        // 2. Rename petugas_gudang (which holds nomor_hp) to koordinator (Super Admin)
        Schema::rename('petugas_gudang', 'koordinator');
        
        // Drop kategori_rumpun_id from new koordinator as it shouldn't have it
        Schema::table('koordinator', function (Blueprint $table) {
            $table->dropForeign('petugas_gudang_kategori_rumpun_id_foreign');
            $table->dropColumn('kategori_rumpun_id');
        });

        // 3. Rename temp_koordinator to petugas_gudang (Staff)
        Schema::rename('temp_koordinator', 'petugas_gudang');
        
        // Add kategori_rumpun_id back to petugas_gudang
        Schema::table('petugas_gudang', function (Blueprint $table) {
            $table->foreignId('kategori_rumpun_id')->nullable()->constrained('kategori_rumpun')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Just reverse the steps
        Schema::table('petugas_gudang', function (Blueprint $table) {
            $table->dropForeign(['kategori_rumpun_id']);
            $table->dropColumn('kategori_rumpun_id');
        });
        Schema::rename('petugas_gudang', 'temp_koordinator');
        
        Schema::table('koordinator', function (Blueprint $table) {
            $table->foreignId('kategori_rumpun_id')->nullable()->constrained('kategori_rumpun')->nullOnDelete();
        });
        Schema::rename('koordinator', 'petugas_gudang');
        Schema::rename('temp_koordinator', 'koordinator');
    }
};
