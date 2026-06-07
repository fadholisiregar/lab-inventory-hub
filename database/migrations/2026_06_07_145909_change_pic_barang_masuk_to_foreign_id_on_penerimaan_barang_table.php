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
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropColumn('pic_barang_masuk');
            $table->foreignId('laboran_id')->nullable()->constrained('laboran')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropForeign(['laboran_id']);
            $table->dropColumn('laboran_id');
            $table->string('pic_barang_masuk')->nullable();
        });
    }
};
