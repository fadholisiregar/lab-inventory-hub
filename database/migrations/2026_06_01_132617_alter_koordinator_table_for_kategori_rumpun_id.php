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
        Schema::table('koordinator', function (Blueprint $table) {
            $table->dropColumn('kategori_rumpun');
            $table->foreignId('kategori_rumpun_id')->nullable()->constrained('kategori_rumpun')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('koordinator', function (Blueprint $table) {
            $table->dropForeign(['kategori_rumpun_id']);
            $table->dropColumn('kategori_rumpun_id');
            $table->string('kategori_rumpun')->nullable();
        });
    }
};
