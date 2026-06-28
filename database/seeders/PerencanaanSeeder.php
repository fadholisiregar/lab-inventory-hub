<?php

namespace Database\Seeders;

use App\Models\ProgramStudi;
use App\Models\MataKuliah;
use App\Models\ModulPraktikum;
use Illuminate\Database\Seeder;

class PerencanaanSeeder extends Seeder
{
    public function run(): void
    {
        $prodiList = [
            ['kode' => 'TK', 'nama' => 'Teknik Kimia'],
            ['kode' => 'TL', 'nama' => 'Teknik Lingkungan'],
            ['kode' => 'FAR', 'nama' => 'Farmasi'],
        ];
        foreach ($prodiList as $p) {
            $prodi = ProgramStudi::firstOrCreate(['nama' => $p['nama']], $p);

            $matkulList = [
                ['kode' => 'PRAK-1', 'nama' => 'Praktikum Kimia Dasar'],
                ['kode' => 'PRAK-2', 'nama' => 'Praktikum Kimia Analitik'],
            ];
            foreach ($matkulList as $m) {
                $mk = MataKuliah::firstOrCreate(
                    ['nama' => $m['nama'], 'program_studi_id' => $prodi->id],
                    array_merge($m, ['program_studi_id' => $prodi->id])
                );

                foreach (['Modul 1 - Pengenalan Alat', 'Modul 2 - Titrasi Asam Basa'] as $modul) {
                    ModulPraktikum::firstOrCreate(
                        ['nama' => $modul, 'mata_kuliah_id' => $mk->id],
                        ['nama' => $modul, 'mata_kuliah_id' => $mk->id]
                    );
                }
            }
        }
    }
}
