<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barang;
use App\Models\BatchBarang;
use App\Models\User;
use Carbon\Carbon;

/**
 * Seeder untuk keperluan testing alur permintaan bahan.
 * Membuat batch data untuk 4 barang:
 *   - 2 barang FEFO (ada tanggal_kadaluarsa) → masing-masing 3 batch dengan exp berbeda
 *   - 2 barang FIFO (tanpa tanggal_kadaluarsa) → masing-masing 3 batch dengan tgl_penerimaan berbeda
 */
class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::first();
        $adminId   = $adminUser?->id;

        $allBarang = Barang::orderBy('id')->limit(6)->get();

        if ($allBarang->count() < 4) {
            $this->command->warn('Jumlah barang di database kurang dari 4. Jalankan BarangKimiaGaramSeeder terlebih dahulu.');
            return;
        }

        // ─── 2 Barang FEFO (ada tanggal_kadaluarsa) ──────────────────────────
        $fefoBarang = $allBarang->slice(0, 2);

        foreach ($fefoBarang as $barang) {
            $barang->tanggal_kadaluarsa = Carbon::now()->addYears(2)->toDateString();
            $barang->save();

            $this->createBatch($barang, [
                [
                    'suffix'          => 'A',
                    'tgl_penerimaan'  => Carbon::now()->subMonths(3)->toDateString(),
                    'tgl_kadaluarsa'  => Carbon::now()->addMonth()->toDateString(),
                    'jumlah'          => 500,
                    'kondisi'         => 'Baik',
                    'lokasi'          => 'Rak A-01',
                ],
                [
                    'suffix'          => 'B',
                    'tgl_penerimaan'  => Carbon::now()->subMonths(2)->toDateString(),
                    'tgl_kadaluarsa'  => Carbon::now()->addMonths(6)->toDateString(),
                    'jumlah'          => 300,
                    'kondisi'         => 'Baik',
                    'lokasi'          => 'Rak A-02',
                ],
                [
                    'suffix'          => 'C',
                    'tgl_penerimaan'  => Carbon::now()->subMonth()->toDateString(),
                    'tgl_kadaluarsa'  => Carbon::now()->addYear()->toDateString(),
                    'jumlah'          => 200,
                    'kondisi'         => 'Baik',
                    'lokasi'          => 'Rak A-03',
                ],
            ], $adminId);

            $this->command->info("FEFO: Barang [{$barang->kode_barang}] {$barang->nama_barang} → 3 batch dibuat");
        }

        // ─── 2 Barang FIFO (tanpa tanggal_kadaluarsa) ────────────────────────
        $fifoBarang = $allBarang->slice(2, 2);

        foreach ($fifoBarang as $barang) {
            $barang->tanggal_kadaluarsa = null;
            $barang->save();

            $this->createBatch($barang, [
                [
                    'suffix'         => 'A',
                    'tgl_penerimaan' => Carbon::now()->subMonths(4)->toDateString(),
                    'tgl_kadaluarsa' => null,
                    'jumlah'         => 400,
                    'kondisi'        => 'Baik',
                    'lokasi'         => 'Rak B-01',
                ],
                [
                    'suffix'         => 'B',
                    'tgl_penerimaan' => Carbon::now()->subMonths(2)->toDateString(),
                    'tgl_kadaluarsa' => null,
                    'jumlah'         => 250,
                    'kondisi'        => 'Baik',
                    'lokasi'         => 'Rak B-02',
                ],
                [
                    'suffix'         => 'C',
                    'tgl_penerimaan' => Carbon::now()->subWeeks(2)->toDateString(),
                    'tgl_kadaluarsa' => null,
                    'jumlah'         => 150,
                    'kondisi'        => 'Baik',
                    'lokasi'         => 'Rak B-03',
                ],
            ], $adminId);

            $this->command->info("FIFO: Barang [{$barang->kode_barang}] {$barang->nama_barang} → 3 batch dibuat");
        }

        $this->command->info('');
        $this->command->info('=== Akun untuk testing ===');
        $this->command->info('Laboran    : laboran@itk.ac.id   / password');
        $this->command->info('Koordinator: koordinator@itk.ac.id / password');
        $this->command->info('Petugas    : petugas@itk.ac.id   / password');
    }

    private function createBatch(Barang $barang, array $batches, ?int $adminId): void
    {
        // Hapus batch lama agar tidak duplikat jika seeder dijalankan ulang
        BatchBarang::where('barang_id', $barang->id)->delete();

        foreach ($batches as $data) {
            $kode = 'BCH-' . $barang->kode_barang . '-' . $data['suffix'];

            BatchBarang::create([
                'barang_id'      => $barang->id,
                'kode_batch'     => $kode,
                'no_lot_penyedia'=> 'LOT-TEST-' . $data['suffix'],
                'tgl_penerimaan' => $data['tgl_penerimaan'],
                'tgl_produksi'   => null,
                'tgl_kadaluarsa' => $data['tgl_kadaluarsa'],
                'jumlah_awal'    => $data['jumlah'],
                'stok_tersisa'   => $data['jumlah'],
                'kondisi'        => $data['kondisi'],
                'no_po'          => 'PO-TEST-2026',
                'penyedia_id'    => null,
                'harga_satuan'   => 50000,
                'status_batch'   => 'Aktif',
                'lokasi_fisik'   => $data['lokasi'],
                'created_by'     => $adminId,
                'updated_by'     => $adminId,
            ]);
        }
    }
}
