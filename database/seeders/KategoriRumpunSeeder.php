<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KategoriRumpun;

class KategoriRumpunSeeder extends Seeder
{
    public function run()
    {
        $rumpuns = [
            ['kode_rumpun' => 'EL', 'nama_rumpun' => 'Elektro', 'keterangan' => 'Rumpun Laboratorium Elektro'],
            ['kode_rumpun' => 'WS', 'nama_rumpun' => 'Workshop', 'keterangan' => 'Rumpun Bengkel dan Workshop'],
            ['kode_rumpun' => 'KM', 'nama_rumpun' => 'Kimia', 'keterangan' => 'Rumpun Laboratorium Kimia'],
            ['kode_rumpun' => 'KN', 'nama_rumpun' => 'Konstruksi', 'keterangan' => 'Rumpun Laboratorium Konstruksi dan Sipil'],
        ];

        foreach ($rumpuns as $rumpun) {
            KategoriRumpun::updateOrCreate(
                ['kode_rumpun' => $rumpun['kode_rumpun']],
                $rumpun
            );
        }
    }
}
