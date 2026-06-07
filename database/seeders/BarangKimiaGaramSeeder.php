<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Satuan;
use App\Models\LokasiPenyimpanan;

class BarangKimiaGaramSeeder extends Seeder
{
    public function run()
    {
        $data = [
            ['BK-GS-0002', 'Zinc Chloride / ZnCl2', 'L-BK-03', 800, 'gram'],
            ['BK-GS-0003', 'Iron (II) Sulfate Heptahydrate / FeSO4 . 7H2O', 'L-BK-03', 3343, 'gram'],
            ['BK-GS-0004', 'Copper (II) Sulfate Pentahydrate / CuSO4 . 5H2O', 'L-BK-03', 3243, 'gram'],
            ['BK-GS-0005', 'Aluminium Sulfate / Al2(SO4)3. 16H2O', 'L-BK-03', 1200, 'gram'],
            ['BK-GS-0006', 'Ammonium Sulfate / (NH4)2SO4', 'L-BK-03', 1100, 'gram'],
            ['BK-GS-0007', 'Ammonium Molybdate / (NH4)2MoO4', 'L-BK-03', 150, 'gram'],
            ['BK-GS-0008', 'Copper (II) Chloride Dihydrate / CuCl2 . 2H2O', 'L-BK-03', 200, 'gram'],
            ['BK-GS-0009', 'Manganese (II) Sulfate Monohydrate / Mn(SO4)2 .H2O', 'L-BK-03', 700, 'gram'],
            ['BK-GS-0010', 'Potassium Acetate / C2H3KO2', 'L-BK-03', 100, 'gram'],
            ['BK-GS-0011', 'Potassium Dihydrogen Phosphate / KH2PO4', 'L-BK-03', 1150, 'gram'],
            ['BK-GS-0012', 'Potassium Disulfite / K2S2O5', 'L-BK-03', 400, 'gram'],
            ['BK-GS-0013', 'Potassium Hexacyanoferrate (III) / K3Fe(CN)6', 'L-BK-03', 690, 'gram'],
            ['BK-GS-0014', 'Potassium Iodide / KI', 'L-BK-03', 848, 'gram'],
            ['BK-GS-0015', 'Potassium Sulfate / K2SO4', 'L-BK-03', 1250, 'gram'],
            ['BK-GS-0016', 'Potassium Sodium Tartrate tetrahydrate / C4H4KNaO6.4H2O', 'L-BK-03', 400, 'gram'],
            ['BK-GS-0017', 'Sodium Acetate Trihydrate / C2H3NaO2.3H2O', 'L-BK-03', 120, 'gram'],
            ['BK-GS-0018', 'Disodium Hydrogen Phosphate / Na2HPO4', 'L-BK-03', 300, 'gram'],
            ['BK-GS-0019', 'Sodium Carbonate Anhydrous / Na2CO3', 'L-BK-03', 2800, 'gram'],
            ['BK-GS-0020', 'Sodium Chloride / NaCl', 'L-BK-03', 1678, 'gram'],
            ['BK-GS-0021', 'Sodium Dihydrogen Phosphate / NaH2PO4', 'L-BK-03', 350, 'gram'],
            ['BK-GS-0022', 'Sodium Nitrite / NaNO2', 'L-BK-03', 960, 'gram'],
        ];

        // Cari Kategori 'BK-GS' (Bahan Kimia - Garam & Senyawa Stabil)
        $kategori = KategoriBarang::where('kode', 'BK-GS')->first();
        if (!$kategori) {
            $kategori = KategoriBarang::firstOrCreate([
                'kode' => 'BK-GS',
                'nama' => 'Bahan Kimia - Garam & Senyawa Stabil'
            ]);
        }

        foreach ($data as $item) {
            $lokasi = LokasiPenyimpanan::firstOrCreate(
                ['kode' => $item[2]],
                ['nama' => 'Lemari Bahan Kimia 03']
            );

            $satuan = Satuan::where('simbol', $item[4])->orWhere('nama_satuan', $item[4])->first();
            if (!$satuan) {
                $satuan = Satuan::firstOrCreate(
                    ['simbol' => $item[4]],
                    ['nama_satuan' => ucfirst($item[4]), 'keterangan' => '-']
                );
            }

            Barang::firstOrCreate(
                ['kode_barang' => $item[0]],
                [
                    'nama_barang' => $item[1],
                    'kategori_id' => $kategori->id,
                    'satuan_id' => $satuan->id,
                    'lokasi_id' => $lokasi->id,
                    'total_stok' => $item[3],
                    'stok_minimum' => 10,
                    'sifat_bahan' => 'Biasa',
                    'perlu_kadaluarsa' => true,
                ]
            );
        }
    }
}
