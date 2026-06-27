<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom 15: kadaluarsa punya 3 state yang harus dibedakan:
     *  - Terisi             : tgl_kadaluarsa diisi
     *  - TidakDicantumkan   : produsen tidak mencantumkan (NULL disengaja)
     *  - BelumDiinput       : menunggu cek label fisik (NULL sementara)
     */
    public function up(): void
    {
        Schema::table('batch_barang', function (Blueprint $table) {
            $table->string('status_kadaluarsa')->nullable()->after('tgl_kadaluarsa');
        });

        DB::statement("UPDATE batch_barang SET status_kadaluarsa = 'Terisi' WHERE tgl_kadaluarsa IS NOT NULL");
    }

    public function down(): void
    {
        Schema::table('batch_barang', function (Blueprint $table) {
            $table->dropColumn('status_kadaluarsa');
        });
    }
};
