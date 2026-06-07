<?php

use App\Models\LokasiPenyimpanan;

$list = [
"R-WS-01",
"R-WS-02",
"R-WS-03",
"R-WS-04",
"R-WS-05",
"R-WS-06",
"R-WS-07",
"R-WS-08",
"R-WS-09",
"P-WS-01",
"P-BG-01",
"R-EK-01",
"R-KP-01",
"R-K3-01",
"L-EK-01",
"L-EK-02",
"L-KP-01",
"L-KP-02",
"FC-01",
"L-AT-01",
"L-AT-02",
"L-AT-03",
"R-AT-01",
"P-AT-01"
];

foreach ($list as $kode) {
    $kode = trim($kode);
    $nama = $kode;
    
    if (str_starts_with($kode, 'L')) {
        $nama = "Lemari " . $kode;
    } elseif (str_starts_with($kode, 'R')) {
        $nama = "Rak " . $kode;
    }
    
    LokasiPenyimpanan::firstOrCreate([
        'kode' => $kode
    ], [
        'nama' => $nama
    ]);
}
echo "Data lokasi penyimpanan berhasil di-seed.\n";
