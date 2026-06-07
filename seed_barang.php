<?php

use App\Models\MasterBarang;
use App\Models\Kategori;
use App\Models\Satuan;
use App\Models\LokasiPenyimpanan;

$kategoriBahan = Kategori::where('nama', 'like', '%Bahan%')->first() ?? Kategori::first();
$kategoriAlat = Kategori::where('nama', 'like', '%Alat%')->first() ?? Kategori::first();

$satuanPcs = Satuan::where('simbol', 'pcs')->first() ?? Satuan::first();
$satuanLiter = Satuan::where('simbol', 'L')->orWhere('simbol', 'ml')->first() ?? Satuan::first();
$satuanGram = Satuan::where('simbol', 'g')->orWhere('simbol', 'kg')->first() ?? Satuan::first();
$satuanBox = Satuan::where('simbol', 'box')->first() ?? Satuan::first();

$lokasiLemari = LokasiPenyimpanan::where('nama', 'like', '%Lemari%')->first() ?? LokasiPenyimpanan::first();
$lokasiRak = LokasiPenyimpanan::where('nama', 'like', '%Rak%')->first() ?? LokasiPenyimpanan::first();

$barangs = [
    [
        'kode_barang' => 'BRG-001',
        'nama_barang' => 'Beaker Glass 250ml',
        'spesifikasi' => 'Kaca Borosilikat, tahan panas',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 10,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-002',
        'nama_barang' => 'Erlenmeyer 500ml',
        'spesifikasi' => 'Kaca Pyrex, leher sempit',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 5,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-003',
        'nama_barang' => 'Mikroskop Binokuler',
        'spesifikasi' => 'Perbesaran 1000x, lampu LED',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiLemari?->id,
        'stok_minimum' => 2,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-004',
        'nama_barang' => 'Asam Sulfat (H2SO4) 98%',
        'spesifikasi' => 'Pro Analis, Merck',
        'kategori_id' => $kategoriBahan?->id,
        'satuan_id' => $satuanLiter?->id,
        'lokasi_id' => $lokasiLemari?->id,
        'stok_minimum' => 2,
        'sifat_bahan' => 'Cair, Korosif',
        'perlu_kadaluarsa' => true,
    ],
    [
        'kode_barang' => 'BRG-005',
        'nama_barang' => 'Natrium Hidroksida (NaOH)',
        'spesifikasi' => 'Pellet, Pro Analis, 1kg',
        'kategori_id' => $kategoriBahan?->id,
        'satuan_id' => $satuanGram?->id,
        'lokasi_id' => $lokasiLemari?->id,
        'stok_minimum' => 5,
        'sifat_bahan' => 'Padat, Korosif',
        'perlu_kadaluarsa' => true,
    ],
    [
        'kode_barang' => 'BRG-006',
        'nama_barang' => 'Pipet Tetes',
        'spesifikasi' => 'Kaca, ujung panjang, 15cm',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 50,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-007',
        'nama_barang' => 'Gelas Ukur 100ml',
        'spesifikasi' => 'Kaca berskala',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 10,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-008',
        'nama_barang' => 'Sarung Tangan Nitril',
        'spesifikasi' => 'Non-powder, isi 100, Ukuran M',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanBox?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 5,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-009',
        'nama_barang' => 'Masker Medis 3-Ply',
        'spesifikasi' => 'Earloop, isi 50',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanBox?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 10,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-010',
        'nama_barang' => 'Timbangan Analitik',
        'spesifikasi' => 'Ketelitian 0.0001g, Max 200g',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiLemari?->id,
        'stok_minimum' => 1,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-011',
        'nama_barang' => 'Tabung Reaksi 10ml',
        'spesifikasi' => 'Kaca Pyrex, tahan panas',
        'kategori_id' => $kategoriAlat?->id,
        'satuan_id' => $satuanPcs?->id,
        'lokasi_id' => $lokasiRak?->id,
        'stok_minimum' => 100,
        'sifat_bahan' => null,
        'perlu_kadaluarsa' => false,
    ],
    [
        'kode_barang' => 'BRG-012',
        'nama_barang' => 'Alkohol (Etanol) 70%',
        'spesifikasi' => 'Teknis, 1 Liter',
        'kategori_id' => $kategoriBahan?->id,
        'satuan_id' => $satuanLiter?->id,
        'lokasi_id' => $lokasiLemari?->id,
        'stok_minimum' => 5,
        'sifat_bahan' => 'Cair, Mudah Terbakar',
        'perlu_kadaluarsa' => true,
    ]
];

foreach ($barangs as $brg) {
    MasterBarang::updateOrCreate(
        ['kode_barang' => $brg['kode_barang']],
        [
            'nama_barang' => $brg['nama_barang'],
            'spesifikasi' => $brg['spesifikasi'],
            'kategori_id' => $brg['kategori_id'],
            'satuan_id' => $brg['satuan_id'],
            'lokasi_id' => $brg['lokasi_id'],
            'stok_minimum' => $brg['stok_minimum'],
            'sifat_bahan' => $brg['sifat_bahan'],
            'perlu_kadaluarsa' => $brg['perlu_kadaluarsa'],
            'total_stok' => 0,
        ]
    );
}

echo "12 Data Master Barang berhasil di-seed.\n";
