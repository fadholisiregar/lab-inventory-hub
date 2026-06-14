<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('satuan', function (Blueprint $table) {
            $table->boolean('is_desimal')->default(false)->after('keterangan');
        });
    }

    public function down(): void
    {
        Schema::table('satuan', function (Blueprint $table) {
            $table->dropColumn('is_desimal');
        });
    }
};
