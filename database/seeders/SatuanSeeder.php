<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Satuan;

class SatuanSeeder extends Seeder
{
    public function run()
    {
        $data = [
            ['simbol' => 'Pcs', 'nama_satuan' => 'Pieces'],
            ['simbol' => 'ml', 'nama_satuan' => 'Mililiter'],
            ['simbol' => 'gram', 'nama_satuan' => 'Gram'],
            ['simbol' => 'meter', 'nama_satuan' => 'Meter'],
            ['simbol' => 'roll', 'nama_satuan' => 'Roll'],
            ['simbol' => 'pack', 'nama_satuan' => 'Pack'],
            ['simbol' => 'unit', 'nama_satuan' => 'Unit'],
            ['simbol' => 'kg', 'nama_satuan' => 'Kilogram'],
            ['simbol' => 'Liter', 'nama_satuan' => 'Liter'],
            ['simbol' => 'cm', 'nama_satuan' => 'Centimeter'],
            ['simbol' => 'mm', 'nama_satuan' => 'Milimeter'],
            ['simbol' => 'Sak', 'nama_satuan' => 'Sak'],
            ['simbol' => 'Lembar', 'nama_satuan' => 'Lembar'],
            ['simbol' => 'Set', 'nama_satuan' => 'Set'],
            ['simbol' => 'Kubik', 'nama_satuan' => 'Kubik'],
        ];

        foreach ($data as $item) {
            Satuan::firstOrCreate(
                ['simbol' => $item['simbol']],
                ['nama_satuan' => $item['nama_satuan'], 'keterangan' => '-']
            );
        }
    }
}
