<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KategoriBarang;

class KategoriBarangSeeder extends Seeder
{
    public function run()
    {
        $kategoris = [
            ['nama' => 'ATK', 'kode' => 'AT'],
            ['nama' => 'Bangunan', 'kode' => 'BG'],
            ['nama' => 'Elektronik', 'kode' => 'EK'],
            ['nama' => 'K3', 'kode' => 'K3'],
            ['nama' => 'Gelas Kimia', 'kode' => 'GK'],
            ['nama' => 'Komputer', 'kode' => 'KP'],
            ['nama' => 'Workshop', 'kode' => 'WS'],
            ['nama' => 'Bahan Kimia - Mudah Terbakar', 'kode' => 'BK-MT'],
            ['nama' => 'Bahan Kimia - Asam Pekat', 'kode' => 'BK-AP'],
            ['nama' => 'Bahan Kimia - Toksik', 'kode' => 'BK-TO'],
            ['nama' => 'Bahan Kimia - Asam Lemah', 'kode' => 'BK-AL'],
            ['nama' => 'Bahan Kimia - Basa', 'kode' => 'BK-BS'],
            ['nama' => 'Bahan Kimia - Logam Reaktif', 'kode' => 'BK-LR'],
            ['nama' => 'Bahan Kimia - Garam & Senyawa Stabil', 'kode' => 'BK-GS'],
            ['nama' => 'Bahan Kimia - Oksidator', 'kode' => 'BK-OX'],
            ['nama' => 'Bahan Kimia - Polimer & Adsorben', 'kode' => 'BK-PA'],
            ['nama' => 'Bahan Kimia - Food Grade', 'kode' => 'BK-FG'],
            ['nama' => 'Bahan Kimia - Mikrobiologi', 'kode' => 'BK-MB'],
            ['nama' => 'Penunjang Gudang', 'kode' => 'PG'],
            ['nama' => 'Penunjang Umum', 'kode' => 'PU'],
            ['nama' => 'Bahan Kimia - Basa Cair', 'kode' => 'BK-BC'],
            ['nama' => 'Bahan Pangan', 'kode' => 'BP'],
            ['nama' => 'Studio & Desain', 'kode' => 'SD'],
            ['nama' => 'Bahan Kimia - Reagen Indikator', 'kode' => 'RI'],
            ['nama' => 'Bahan Kimia - Gas Bertekanan', 'kode' => 'BK-GB'],
        ];

        foreach ($kategoris as $kategori) {
            KategoriBarang::firstOrCreate(
                ['kode' => $kategori['kode']],
                ['nama' => $kategori['nama'], 'keterangan' => '-']
            );
        }
    }
}
