<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barang;
use App\Models\BatchBarang;
use App\Models\KategoriBarang;
use App\Models\Satuan;
use App\Models\LokasiPenyimpanan;
use App\Models\User;
use Carbon\Carbon;

class ElektronikSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::first()?->id;

        // ── Kategori ──────────────────────────────────────────────────────────
        $katBaterai = KategoriBarang::firstOrCreate(
            ['kode' => 'EL-BAT'],
            ['nama' => 'Elektronik - Baterai & Sel Energi']
        );
        $katKomponen = KategoriBarang::firstOrCreate(
            ['kode' => 'EL-KMP'],
            ['nama' => 'Elektronik - Komponen Pasif']
        );
        $katPCB = KategoriBarang::firstOrCreate(
            ['kode' => 'EL-PCB'],
            ['nama' => 'Elektronik - PCB & Modul']
        );

        // ── Satuan ────────────────────────────────────────────────────────────
        $pcs   = Satuan::where('simbol', 'Pcs')->first()
               ?? Satuan::firstOrCreate(['simbol' => 'Pcs'], ['nama_satuan' => 'Pieces', 'keterangan' => '-']);
        $lembar = Satuan::firstOrCreate(
            ['simbol' => 'Lembar'],
            ['nama_satuan' => 'Lembar', 'keterangan' => '-']
        );

        // ── Lokasi ────────────────────────────────────────────────────────────
        $lokasiEL = LokasiPenyimpanan::firstOrCreate(
            ['kode' => 'L-EL-01'],
            ['nama' => 'Lemari Komponen Elektronik']
        );
        $lokasiBAT = LokasiPenyimpanan::firstOrCreate(
            ['kode' => 'L-EL-02'],
            ['nama' => 'Lemari Baterai & Energi']
        );

        // ═════════════════════════════════════════════════════════════════════
        // BARANG DENGAN KADALUARSA → FEFO
        // ═════════════════════════════════════════════════════════════════════
        $fefoItems = [
            [
                'kode'   => 'EL-BAT-001',
                'nama'   => 'Baterai AA 1.5V (Alkaline)',
                'stok'   => 180,
                'exp_master' => Carbon::now()->addYears(3)->toDateString(),
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-5 months', 'exp' => '+2 months',  'jml' => 60,  'lok' => 'Rak BAT-01'],
                    ['suf' => 'B', 'masuk' => '-3 months', 'exp' => '+8 months',  'jml' => 60,  'lok' => 'Rak BAT-02'],
                    ['suf' => 'C', 'masuk' => '-1 month',  'exp' => '+18 months', 'jml' => 60,  'lok' => 'Rak BAT-03'],
                ],
            ],
            [
                'kode'   => 'EL-BAT-002',
                'nama'   => 'Baterai 9V Kotak (Alkaline)',
                'stok'   => 90,
                'exp_master' => Carbon::now()->addYears(3)->toDateString(),
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-4 months', 'exp' => '+3 months',  'jml' => 30,  'lok' => 'Rak BAT-01'],
                    ['suf' => 'B', 'masuk' => '-2 months', 'exp' => '+9 months',  'jml' => 30,  'lok' => 'Rak BAT-02'],
                    ['suf' => 'C', 'masuk' => '-3 weeks',  'exp' => '+20 months', 'jml' => 30,  'lok' => 'Rak BAT-03'],
                ],
            ],
            [
                'kode'   => 'EL-BAT-003',
                'nama'   => 'Baterai CR2032 Coin Cell 3V',
                'stok'   => 120,
                'exp_master' => Carbon::now()->addYears(5)->toDateString(),
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-6 months', 'exp' => '+5 months',  'jml' => 40,  'lok' => 'Rak BAT-04'],
                    ['suf' => 'B', 'masuk' => '-3 months', 'exp' => '+14 months', 'jml' => 40,  'lok' => 'Rak BAT-04'],
                    ['suf' => 'C', 'masuk' => '-1 month',  'exp' => '+36 months', 'jml' => 40,  'lok' => 'Rak BAT-05'],
                ],
            ],
        ];

        foreach ($fefoItems as $item) {
            $barang = Barang::updateOrCreate(
                ['kode_barang' => $item['kode']],
                [
                    'nama_barang'        => $item['nama'],
                    'kategori_id'        => $katBaterai->id,
                    'satuan_id'          => $pcs->id,
                    'lokasi_id'          => $lokasiBAT->id,
                    'total_stok'         => $item['stok'],
                    'stok_minimum'       => 10,
                    'tanggal_kadaluarsa' => $item['exp_master'],
                    'created_by'         => $adminId,
                    'updated_by'         => $adminId,
                ]
            );

            BatchBarang::where('barang_id', $barang->id)->delete();

            foreach ($item['batches'] as $b) {
                BatchBarang::create([
                    'barang_id'       => $barang->id,
                    'kode_batch'      => 'BCH-' . $item['kode'] . '-' . $b['suf'],
                    'no_lot_supplier' => 'LOT-EL-' . $b['suf'],
                    'tgl_penerimaan'  => Carbon::now()->modify($b['masuk'])->toDateString(),
                    'tgl_produksi'    => null,
                    'tgl_kadaluarsa'  => Carbon::now()->modify($b['exp'])->toDateString(),
                    'jumlah_awal'     => $b['jml'],
                    'stok_tersisa'    => $b['jml'],
                    'kondisi'         => 'Baik',
                    'no_po'           => 'PO-EL-2026',
                    'supplier_id'     => null,
                    'harga_satuan'    => 5000,
                    'status_batch'    => 'Aktif',
                    'lokasi_fisik'    => $b['lok'],
                    'created_by'      => $adminId,
                    'updated_by'      => $adminId,
                ]);
            }

            $this->command->info("FEFO ✓ [{$item['kode']}] {$item['nama']} — 3 batch");
        }

        // ═════════════════════════════════════════════════════════════════════
        // BARANG TANPA KADALUARSA → FIFO
        // ═════════════════════════════════════════════════════════════════════
        $fifoItems = [
            [
                'kode'  => 'EL-KMP-001',
                'nama'  => 'Resistor 100 Ohm 1/4W (Carbon Film)',
                'stok'  => 750,
                'kat'   => $katKomponen,
                'sat'   => $pcs,
                'lok'   => $lokasiEL,
                'harga' => 500,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-5 months', 'jml' => 300, 'lok' => 'Laci EL-01'],
                    ['suf' => 'B', 'masuk' => '-2 months', 'jml' => 250, 'lok' => 'Laci EL-01'],
                    ['suf' => 'C', 'masuk' => '-2 weeks',  'jml' => 200, 'lok' => 'Laci EL-01'],
                ],
            ],
            [
                'kode'  => 'EL-KMP-002',
                'nama'  => 'Resistor 10K Ohm 1/4W (Carbon Film)',
                'stok'  => 600,
                'kat'   => $katKomponen,
                'sat'   => $pcs,
                'lok'   => $lokasiEL,
                'harga' => 500,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-6 months', 'jml' => 250, 'lok' => 'Laci EL-02'],
                    ['suf' => 'B', 'masuk' => '-3 months', 'jml' => 200, 'lok' => 'Laci EL-02'],
                    ['suf' => 'C', 'masuk' => '-1 month',  'jml' => 150, 'lok' => 'Laci EL-02'],
                ],
            ],
            [
                'kode'  => 'EL-KMP-003',
                'nama'  => 'Kapasitor Elektrolit 100uF / 25V',
                'stok'  => 450,
                'kat'   => $katKomponen,
                'sat'   => $pcs,
                'lok'   => $lokasiEL,
                'harga' => 1500,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-4 months', 'jml' => 200, 'lok' => 'Laci EL-03'],
                    ['suf' => 'B', 'masuk' => '-2 months', 'jml' => 150, 'lok' => 'Laci EL-03'],
                    ['suf' => 'C', 'masuk' => '-3 weeks',  'jml' => 100, 'lok' => 'Laci EL-03'],
                ],
            ],
            [
                'kode'  => 'EL-KMP-004',
                'nama'  => 'Kapasitor Keramik 0.1uF / 50V (104)',
                'stok'  => 900,
                'kat'   => $katKomponen,
                'sat'   => $pcs,
                'lok'   => $lokasiEL,
                'harga' => 500,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-7 months', 'jml' => 400, 'lok' => 'Laci EL-04'],
                    ['suf' => 'B', 'masuk' => '-3 months', 'jml' => 300, 'lok' => 'Laci EL-04'],
                    ['suf' => 'C', 'masuk' => '-2 weeks',  'jml' => 200, 'lok' => 'Laci EL-04'],
                ],
            ],
            [
                'kode'  => 'EL-KMP-005',
                'nama'  => 'LED 5mm Merah (20mA)',
                'stok'  => 500,
                'kat'   => $katKomponen,
                'sat'   => $pcs,
                'lok'   => $lokasiEL,
                'harga' => 800,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-5 months', 'jml' => 200, 'lok' => 'Laci EL-05'],
                    ['suf' => 'B', 'masuk' => '-2 months', 'jml' => 200, 'lok' => 'Laci EL-05'],
                    ['suf' => 'C', 'masuk' => '-1 week',   'jml' => 100, 'lok' => 'Laci EL-05'],
                ],
            ],
            [
                'kode'  => 'EL-PCB-001',
                'nama'  => 'PCB Universal 5x7 cm (Lubang 2.54mm)',
                'stok'  => 150,
                'kat'   => $katPCB,
                'sat'   => $lembar,
                'lok'   => $lokasiEL,
                'harga' => 8000,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-8 months', 'jml' => 60,  'lok' => 'Rak PCB-01'],
                    ['suf' => 'B', 'masuk' => '-4 months', 'jml' => 50,  'lok' => 'Rak PCB-01'],
                    ['suf' => 'C', 'masuk' => '-1 month',  'jml' => 40,  'lok' => 'Rak PCB-01'],
                ],
            ],
            [
                'kode'  => 'EL-PCB-002',
                'nama'  => 'PCB Universal 7x9 cm (Lubang 2.54mm)',
                'stok'  => 90,
                'kat'   => $katPCB,
                'sat'   => $lembar,
                'lok'   => $lokasiEL,
                'harga' => 12000,
                'batches' => [
                    ['suf' => 'A', 'masuk' => '-6 months', 'jml' => 40,  'lok' => 'Rak PCB-02'],
                    ['suf' => 'B', 'masuk' => '-3 months', 'jml' => 30,  'lok' => 'Rak PCB-02'],
                    ['suf' => 'C', 'masuk' => '-2 weeks',  'jml' => 20,  'lok' => 'Rak PCB-02'],
                ],
            ],
        ];

        foreach ($fifoItems as $item) {
            $barang = Barang::updateOrCreate(
                ['kode_barang' => $item['kode']],
                [
                    'nama_barang'        => $item['nama'],
                    'kategori_id'        => $item['kat']->id,
                    'satuan_id'          => $item['sat']->id,
                    'lokasi_id'          => $item['lok']->id,
                    'total_stok'         => $item['stok'],
                    'stok_minimum'       => 10,
                    'tanggal_kadaluarsa' => null,
                    'created_by'         => $adminId,
                    'updated_by'         => $adminId,
                ]
            );

            BatchBarang::where('barang_id', $barang->id)->delete();

            foreach ($item['batches'] as $b) {
                BatchBarang::create([
                    'barang_id'       => $barang->id,
                    'kode_batch'      => 'BCH-' . $item['kode'] . '-' . $b['suf'],
                    'no_lot_supplier' => 'LOT-EL-' . $b['suf'],
                    'tgl_penerimaan'  => Carbon::now()->modify($b['masuk'])->toDateString(),
                    'tgl_produksi'    => null,
                    'tgl_kadaluarsa'  => null,
                    'jumlah_awal'     => $b['jml'],
                    'stok_tersisa'    => $b['jml'],
                    'kondisi'         => 'Baik',
                    'no_po'           => 'PO-EL-2026',
                    'supplier_id'     => null,
                    'harga_satuan'    => $item['harga'],
                    'status_batch'    => 'Aktif',
                    'lokasi_fisik'    => $b['lok'],
                    'created_by'      => $adminId,
                    'updated_by'      => $adminId,
                ]);
            }

            $this->command->info("FIFO ✓ [{$item['kode']}] {$item['nama']} — 3 batch");
        }

        $this->command->info('');
        $this->command->info('Total barang elektronik: ' . (count($fefoItems) + count($fifoItems)));
        $this->command->info('FEFO (ada kadaluarsa): ' . count($fefoItems) . ' barang → Baterai AA, 9V, CR2032');
        $this->command->info('FIFO (tanpa kadaluarsa): ' . count($fifoItems) . ' barang → Resistor, Kapasitor, LED, PCB');
    }
}
