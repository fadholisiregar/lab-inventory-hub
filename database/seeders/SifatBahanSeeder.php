<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SifatBahanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['nama' => 'Beracun (Toxic)', 'warna' => 'rose'],
            ['nama' => 'Mudah Terbakar (Flammable)', 'warna' => 'orange'],
            ['nama' => 'Korosif (Corrosive)', 'warna' => 'yellow'],
            ['nama' => 'Oksidator (Oxidizing)', 'warna' => 'blue'],
            ['nama' => 'Iritan (Irritant)', 'warna' => 'amber'],
            ['nama' => 'Mudah Meledak (Explosive)', 'warna' => 'red'],
            ['nama' => 'Radioaktif (Radioactive)', 'warna' => 'purple'],
            ['nama' => 'Bahaya Lingkungan', 'warna' => 'emerald'],
        ];

        foreach ($data as $item) {
            \App\Models\SifatBahan::create($item);
        }
    }
}
