<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MasterBarang;
use App\Models\BatchBarang;
use App\Models\RencanaKebutuhanBarang;
use App\Models\DetailRkb;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GenerateDraftRKB extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:generate-rkb';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deteksi stok kritis dan kadaluarsa untuk generate Draft Rencana Kebutuhan Barang';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Memulai deteksi stok kritis dan kadaluarsa...');

        $criticalItems = [];

        // 1. Deteksi Stok di Bawah Minimum
        $masterBarangs = MasterBarang::withSum(['batches as total_stok' => function ($query) {
            $query->where('status_batch', 'Aktif');
        }], 'stok_tersisa')->get();

        foreach ($masterBarangs as $barang) {
            if ($barang->total_stok < $barang->stok_minimum) {
                $criticalItems[$barang->id] = [
                    'alasan' => 'Stok di Bawah Minimum',
                    'jumlah_rekomendasi' => $barang->stok_minimum - $barang->total_stok
                ];
            }
        }

        // 2. Deteksi Batch Mendekati Kadaluarsa (H-90)
        $thresholdDate = Carbon::now()->addDays(90)->toDateString();
        $expiringBatches = BatchBarang::whereNotNull('tgl_kadaluarsa')
            ->where('status_batch', 'Aktif')
            ->where('tgl_kadaluarsa', '<=', $thresholdDate)
            ->get();

        foreach ($expiringBatches as $batch) {
            if (!isset($criticalItems[$batch->barang_id])) {
                $criticalItems[$batch->barang_id] = [
                    'alasan' => 'Mendekati Kadaluarsa',
                    'jumlah_rekomendasi' => $batch->stok_tersisa // Merekomendasikan sejumlah stok yang akan expired
                ];
            }
        }

        if (empty($criticalItems)) {
            $this->info('Tidak ada barang kritis atau mendekati kadaluarsa. RKB tidak dibuat.');
            return;
        }

        // 3. Buat Draft RKB
        DB::transaction(function () use ($criticalItems) {
            $rkb = RencanaKebutuhanBarang::create([
                'status' => 'Draft',
                'tgl_generate' => now()
            ]);

            foreach ($criticalItems as $barang_id => $data) {
                DetailRkb::create([
                    'rencana_kebutuhan_barang_id' => $rkb->id,
                    'barang_id' => $barang_id,
                    'alasan_kebutuhan' => $data['alasan'],
                    'jumlah_rekomendasi' => $data['jumlah_rekomendasi'] > 0 ? $data['jumlah_rekomendasi'] : 1
                ]);
            }

            $this->info('Draft RKB berhasil di-generate dengan ID: ' . $rkb->id);
        });
    }
}
