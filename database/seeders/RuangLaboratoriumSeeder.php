<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RuangLaboratorium;

class RuangLaboratoriumSeeder extends Seeder
{
    public function run()
    {
        $data = [
            "Workshop B - Perakitan (R102)",
            "Lab. Rekayasa Konstruksi dan Transportasi (R103)",
            "Lab Uji Destruktif dan Non Destruktif (R104)",
            "Lab. Teknologi Proses (R105)",
            "Lab. Sistem Tenaga Listrik dan Otomasi (R106)",
            "Lab. Karakterisasi A (R107)",
            "Lab. Karakterisasi B (R108)",
            "Lab. Termal (R109)",
            "Lab. Kimia Dasar A (R201)",
            "Lab. Fisika Dasar",
            "Kantor Administrasi A (R203)",
            "Kantor Administrasi B (R204)",
            "Ruang Kerja Bersama (R205)",
            "Ruang Kerja Bersama (R206)",
            "Workshop A - Manufaktur (R101)",
            "Lab. Kimia Dasar B (R208)",
            "Lab. Komputer A (R301)",
            "Lab. Komputer B (R302)",
            "Lab. Komputer C (R303)",
            "Lab. Komputer D (R304)",
            "Lab. Komputer E (R305)",
            "Lab. Komputer F (R306)",
            "Lab. Komputer G (R307)",
            "Lab. Karakterisasi C (R101)",
            "Lab. Operasi Teknologi Kimia (R102)",
            "Lab. Rekayasa Lingkungan dan Pengolahan Limbah (R103)",
            "Lab. Rekayasa Industri dan Ergonomi (R106)",
            "Lab. Rekayasa Keselamatan (R107)",
            "Lab. Proses Produksi 1 (R108)",
            "Lab. Proses Produksi 2 DT & NDT (R108)",
            "Lab. Permesinan dan Konversi Energi (R109)",
            "Lab. Konstruksi Bangunan Laut (R115)",
            "Lab. Geoteknik dan Ukur Tanah (R116)",
            "Lab. Hidrodinamika dan Aerodinamika (R118)",
            "Lab. Pusat Penelitian Energi (R201)",
            "Lab. Kimia Material (R202)",
            "Lab. Pusat Penelitian Pangan Pertanian (R203)",
            "Lab. Teknologi Pangan (R204)",
            "Kantor Administrasi (R205)",
            "Lab Logistik & Manajemen Rantai Pasok (R206)",
            "Ruang Seminar (R207)",
            "Lab Fisika Lanjut (R301)",
            "Lab Elektronika dan Robotika (R302)",
            "Lab Komputasi Tinggi (R303)",
            "Lab Telekomunikasi dan Jaringan Komputer (R304)",
            "Lab Pengembangan Perangkat Lunak (R305)",
            "Studio Perencanaan Tata Ruang (R306)",
            "Studio Arsitektur dan Desain (R307)",
            "Lab Pusat Penelitian Smart City (R308)",
            "Area Kimia Gudang Bahan",
            "Workshop A - Manufaktur (R101)",
            "Musholla Lab. Terpadu 2",
            "TPS Limbah Lab Terpadu 1",
            "Gudang Bahan Praktikum (R105)",
            "Gudang Penitipan Bahan Penelitian (R104)",
            "TPS Limbah Lab Terpadu 2"
        ];

        foreach ($data as $item) {
            $item = trim($item);
            if (preg_match('/^(.*?)\s*\(([^)]+)\)$/', $item, $matches)) {
                $nama = trim($matches[1]);
                $kode = trim($matches[2]);
            } else {
                $nama = $item;
                $kode = null;
            }

            // Gunakan firstOrCreate untuk menghindari duplikat
            RuangLaboratorium::firstOrCreate(
                ['nama' => $nama], // Cari berdasarkan nama agar tidak dobel misal ada yang sama kodenya
                ['kode' => $kode, 'keterangan' => '-']
            );
        }
    }
}
