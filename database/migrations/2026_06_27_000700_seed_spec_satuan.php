<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Lengkapi master satuan dengan nilai ENUM spec yang belum ada (mg, Botol).
     * Simbol lain (mL, L, Pak, Rol) ditangani via alias di ImportBarangMasukController.
     */
    public function up(): void
    {
        $now = now();
        $rows = [
            ['simbol' => 'mg',    'nama_satuan' => 'Miligram', 'is_desimal' => true],
            ['simbol' => 'Botol', 'nama_satuan' => 'Botol',    'is_desimal' => false],
        ];
        foreach ($rows as $r) {
            $exists = DB::table('satuan')->whereRaw('LOWER(simbol) = ?', [strtolower($r['simbol'])])->exists();
            if (!$exists) {
                DB::table('satuan')->insert(array_merge($r, ['created_at' => $now, 'updated_at' => $now]));
            }
        }
    }

    public function down(): void
    {
        DB::table('satuan')->whereIn('simbol', ['mg', 'Botol'])->delete();
    }
};
