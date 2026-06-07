<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusTransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'kategori' => 'Masuk',
                'kode' => 'BM-PENDING',
                'nama' => 'Pending',
                'keterangan' => 'Penerimaan barang menunggu verifikasi',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Masuk',
                'kode' => 'BM-DISETUJUI',
                'nama' => 'Disetujui',
                'keterangan' => 'Penerimaan disetujui dan stok ditambahkan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Masuk',
                'kode' => 'BM-DITOLAK',
                'nama' => 'Ditolak',
                'keterangan' => 'Penerimaan ditolak',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Keluar',
                'kode' => 'BK-PENDING',
                'nama' => 'Pending',
                'keterangan' => 'Pengeluaran menunggu verifikasi',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Keluar',
                'kode' => 'BK-DISETUJUI',
                'nama' => 'Disetujui',
                'keterangan' => 'Telah disetujui, menunggu eksekusi/pengambilan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Keluar',
                'kode' => 'BK-MENUNGGU',
                'nama' => 'Menunggu Konfirmasi',
                'keterangan' => 'Menunggu konfirmasi penerima',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Keluar',
                'kode' => 'BK-SELESAI',
                'nama' => 'Selesai',
                'keterangan' => 'Transaksi pengeluaran selesai',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'kategori' => 'Keluar',
                'kode' => 'BK-DITOLAK',
                'nama' => 'Ditolak',
                'keterangan' => 'Pengajuan pengeluaran ditolak',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        DB::table('status_transaksi')->insert($statuses);
    }
}
