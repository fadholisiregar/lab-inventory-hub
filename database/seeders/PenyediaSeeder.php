<?php

namespace Database\Seeders;

use App\Models\Penyedia;
use Illuminate\Database\Seeder;

class PenyediaSeeder extends Seeder
{
    public function run(): void
    {
        // Data vendor asli sesuai sheet "Master Vendor" pada template SIGMA/ITK.
        $data = [
            ['kode_penyedia' => 'VND-001-SUK', 'nama_penyedia' => 'PT Sumber Utama Kimiamurni'],
            ['kode_penyedia' => 'VND-002-NGL', 'nama_penyedia' => 'CV Nurra Gemilang'],
            ['kode_penyedia' => 'VND-003-FIL', 'nama_penyedia' => 'CV Faeyza Improchem Lakarya'],
            ['kode_penyedia' => 'VND-004-DSO', 'nama_penyedia' => 'PT Dira Sonita'],
            ['kode_penyedia' => 'VND-005-BAB', 'nama_penyedia' => 'CV Berkah Asza Bersaudara'],
            ['kode_penyedia' => 'VND-006-EBT', 'nama_penyedia' => 'CV EB Teknologi Solusi'],
            ['kode_penyedia' => 'VND-007-APU', 'nama_penyedia' => 'CV Alson Prima Utama'],
            ['kode_penyedia' => 'VND-008-TRS', 'nama_penyedia' => 'CV Tiga Rizal Sejahtera'],
            ['kode_penyedia' => 'VND-009-MMG', 'nama_penyedia' => 'CV Mitra Multi Guna'],
            ['kode_penyedia' => 'VND-010-MBS', 'nama_penyedia' => 'PT Meranti Buana Satria'],
            ['kode_penyedia' => 'VND-011-OSI', 'nama_penyedia' => 'PT Officepedia Solusi Indonesia'],
        ];

        foreach ($data as $row) {
            Penyedia::updateOrCreate(['kode_penyedia' => $row['kode_penyedia']], $row);
        }

        // Bersihkan kode contoh lama (placeholder) bila masih ada & belum dipakai.
        Penyedia::whereIn('kode_penyedia', ['VND-001-SKJ', 'VND-002-MLP', 'VND-003-ATG'])
            ->whereDoesntHave('batchBarang')
            ->delete();
    }
}
