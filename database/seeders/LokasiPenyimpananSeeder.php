<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LokasiPenyimpanan;

class LokasiPenyimpananSeeder extends Seeder
{
    public function run()
    {
        $kodes = [
            'R-WS-01', 'R-WS-02', 'R-WS-03', 'R-WS-04', 'R-WS-05',
            'R-WS-06', 'R-WS-07', 'R-WS-08', 'R-WS-09', 'P-WS-01',
            'P-BG-01', 'R-EK-01', 'R-KP-01', 'R-K3-01', 'L-EK-01',
            'L-EK-02', 'L-KP-01', 'L-KP-02', 'FC-01', 'L-AT-01',
            'L-AT-02', 'L-AT-03', 'R-AT-01', 'P-AT-01'
        ];

        foreach ($kodes as $kode) {
            $parts = explode('-', $kode);
            $nama = '';
            
            if ($parts[0] === 'L') {
                $nama = 'Lemari ' . implode(' ', array_slice($parts, 1));
            } elseif ($parts[0] === 'R') {
                $nama = 'Rak ' . implode(' ', array_slice($parts, 1));
            } else {
                // Untuk awalan selain L dan R (seperti P dan FC)
                $nama = str_replace('-', ' ', $kode);
            }

            LokasiPenyimpanan::firstOrCreate(
                ['kode' => $kode],
                ['nama' => $nama, 'keterangan' => '-']
            );
        }
    }
}
