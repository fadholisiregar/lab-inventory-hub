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
        // 1. Drop kategori_rumpun_id from koordinator
        Schema::table('koordinator', function (Blueprint $table) {
            $table->dropForeign(['kategori_rumpun_id']);
            $table->dropColumn('kategori_rumpun_id');
        });

        // 2. Rename admin_gudang to petugas_gudang and add kategori_rumpun_id
        Schema::rename('admin_gudang', 'petugas_gudang');
        
        Schema::table('petugas_gudang', function (Blueprint $table) {
            $table->foreignId('kategori_rumpun_id')->nullable()->constrained('kategori_rumpun')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('petugas_gudang', function (Blueprint $table) {
            $table->dropForeign(['kategori_rumpun_id']);
            $table->dropColumn('kategori_rumpun_id');
        });

        Schema::rename('petugas_gudang', 'admin_gudang');

        Schema::table('koordinator', function (Blueprint $table) {
            $table->foreignId('kategori_rumpun_id')->nullable()->constrained('kategori_rumpun')->nullOnDelete();
        });
    }
};
