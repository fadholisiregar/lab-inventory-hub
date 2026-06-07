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
        Schema::table('master_barang', function (Blueprint $table) {
            $table->dropColumn('satuan');
            $table->foreignId('satuan_id')->nullable()->after('kategori_id')->constrained('satuans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_barang', function (Blueprint $table) {
            $table->dropForeign(['satuan_id']);
            $table->dropColumn('satuan_id');
            $table->string('satuan')->after('kategori_id')->nullable();
        });
    }
};
