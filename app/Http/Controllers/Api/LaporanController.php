<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Models\Barang;
use App\Models\BatchBarang;
use App\Models\PenerimaanBarang;
use App\Models\PengeluaranBarang;
use App\Models\DetailRpb;
use App\Models\RencanaPengambilanBahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanController extends Controller
{
    /**
     * Rekap Transaksi per Periode
     * GET /api/laporan/rekap-transaksi?bulan=6&tahun=2026
     * GET /api/laporan/rekap-transaksi?dari=2026-01-01&sampai=2026-06-30
     */
    public function rekapTransaksi(Request $request)
    {
        // Determine date range
        if ($request->has('dari') && $request->has('sampai')) {
            $dari = Carbon::parse($request->dari)->startOfDay();
            $sampai = Carbon::parse($request->sampai)->endOfDay();
        } else {
            $bulan = $request->input('bulan', now()->month);
            $tahun = $request->input('tahun', now()->year);
            $dari = Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $sampai = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        }

        // Get all transactions within the period
        $transaksi = Transaksi::with(['barang.satuan', 'barang.kategori', 'pengaju', 'penerimaanBarang.statusTransaksi', 'pengeluaranBarang.statusTransaksi'])
            ->whereBetween('created_at', [$dari, $sampai])
            ->orderBy('created_at', 'desc')
            ->get();

        // Summary
        $totalMasuk = $transaksi->where('jenis', 'Masuk')->count();
        $totalKeluar = $transaksi->where('jenis', 'Keluar')->count();

        // Nilai masuk (from penerimaan_barang harga_total)
        $nilaiMasuk = 0;
        foreach ($transaksi->where('jenis', 'Masuk') as $t) {
            if ($t->penerimaanBarang) {
                $nilaiMasuk += (float) ($t->penerimaanBarang->harga_total ?? 0);
            }
        }

        // Chart data: group by date
        $chartData = $transaksi->groupBy(function ($item) {
            return $item->created_at->format('Y-m-d');
        })->map(function ($group, $date) {
            return [
                'tanggal' => $date,
                'masuk' => $group->where('jenis', 'Masuk')->count(),
                'keluar' => $group->where('jenis', 'Keluar')->count(),
            ];
        })->values();

        // Fill missing dates
        $allDates = [];
        $current = $dari->copy();
        while ($current->lte($sampai)) {
            $dateStr = $current->format('Y-m-d');
            $existing = $chartData->firstWhere('tanggal', $dateStr);
            $allDates[] = $existing ?? [
                'tanggal' => $dateStr,
                'masuk' => 0,
                'keluar' => 0,
            ];
            $current->addDay();
        }

        // Detail list
        $detail = $transaksi->map(function ($t) {
            $statusNama = '-';
            if ($t->jenis === 'Masuk' && $t->penerimaanBarang) {
                $statusNama = $t->penerimaanBarang->statusTransaksi->nama ?? '-';
            } elseif ($t->jenis === 'Keluar' && $t->pengeluaranBarang) {
                $statusNama = $t->pengeluaranBarang->statusTransaksi->nama ?? '-';
            }

            return [
                'id' => $t->id,
                'tanggal' => $t->created_at->format('Y-m-d H:i'),
                'jenis' => $t->jenis,
                'barang' => $t->barang->nama_barang ?? '-',
                'jumlah' => $t->jumlah,
                'satuan' => $t->barang->satuan->nama ?? '-',
                'status' => $statusNama,
                'pengaju' => $t->pengaju->name ?? '-',
            ];
        });

        return response()->json([
            'summary' => [
                'total_masuk' => $totalMasuk,
                'total_keluar' => $totalKeluar,
                'total_transaksi' => $totalMasuk + $totalKeluar,
                'nilai_masuk' => $nilaiMasuk,
            ],
            'chart_data' => $allDates,
            'detail' => $detail,
        ]);
    }

    /**
     * Barang Paling Sering Diminta
     * GET /api/laporan/barang-populer?bulan=6&tahun=2026&limit=10
     */
    public function barangPopuler(Request $request)
    {
        // Determine date range
        if ($request->has('dari') && $request->has('sampai')) {
            $dari = Carbon::parse($request->dari)->startOfDay();
            $sampai = Carbon::parse($request->sampai)->endOfDay();
        } else {
            $bulan = $request->input('bulan', now()->month);
            $tahun = $request->input('tahun', now()->year);
            $dari = Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $sampai = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        }

        $limit = $request->input('limit', 10);

        // Query: group by barang_id from transaksi where jenis = 'Keluar'
        $data = Transaksi::select(
                'barang_id',
                DB::raw('COUNT(*) as frekuensi'),
                DB::raw('SUM(jumlah) as total_jumlah')
            )
            ->where('jenis', 'Keluar')
            ->whereBetween('created_at', [$dari, $sampai])
            ->groupBy('barang_id')
            ->orderByDesc('frekuensi')
            ->limit($limit)
            ->get();

        // Enrich with barang details
        $result = $data->map(function ($item, $index) {
            $barang = Barang::with(['satuan', 'kategori'])->find($item->barang_id);
            return [
                'ranking' => $index + 1,
                'barang_id' => $item->barang_id,
                'nama_barang' => $barang->nama_barang ?? '-',
                'kategori' => $barang->kategori->nama ?? '-',
                'total_jumlah' => (float) $item->total_jumlah,
                'satuan' => $barang->satuan->nama ?? '-',
                'frekuensi' => (int) $item->frekuensi,
            ];
        });

        // Chart data
        $chartData = $result->map(function ($item) {
            return [
                'nama' => $item['nama_barang'],
                'jumlah' => $item['total_jumlah'],
                'frekuensi' => $item['frekuensi'],
            ];
        });

        return response()->json([
            'data' => $result,
            'chart_data' => $chartData,
        ]);
    }

    /**
     * Efisiensi Pemakaian vs Rencana
     * GET /api/laporan/efisiensi?bulan=6&tahun=2026
     */
    public function efisiensi(Request $request)
    {
        // Determine date range
        if ($request->has('dari') && $request->has('sampai')) {
            $dari = Carbon::parse($request->dari)->startOfDay();
            $sampai = Carbon::parse($request->sampai)->endOfDay();
        } else {
            $bulan = $request->input('bulan', now()->month);
            $tahun = $request->input('tahun', now()->year);
            $dari = Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $sampai = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        }

        // Get rencana (RPB details) within the period
        $rencana = DetailRpb::whereHas('rencanaPengambilanBahan', function ($q) use ($dari, $sampai) {
                $q->whereBetween('created_at', [$dari, $sampai]);
            })
            ->select('barang_id', DB::raw('SUM(jumlah_diminta) as jumlah_rencana'))
            ->groupBy('barang_id')
            ->get()
            ->keyBy('barang_id');

        // Get realisasi (transaksi keluar) within the period
        $realisasi = Transaksi::where('jenis', 'Keluar')
            ->whereBetween('created_at', [$dari, $sampai])
            ->select('barang_id', DB::raw('SUM(jumlah) as jumlah_realisasi'))
            ->groupBy('barang_id')
            ->get()
            ->keyBy('barang_id');

        // Merge all unique barang_ids
        $allBarangIds = $rencana->keys()->merge($realisasi->keys())->unique();

        $data = [];
        $totalRencana = 0;
        $totalRealisasi = 0;
        $efisiensiList = [];

        foreach ($allBarangIds as $barangId) {
            $barang = Barang::with(['satuan'])->find($barangId);
            if (!$barang) continue;

            $jmlRencana = (float) ($rencana->get($barangId)->jumlah_rencana ?? 0);
            $jmlRealisasi = (float) ($realisasi->get($barangId)->jumlah_realisasi ?? 0);
            $selisih = $jmlRealisasi - $jmlRencana;

            $efisiensiPersen = $jmlRencana > 0 
                ? round(($jmlRealisasi / $jmlRencana) * 100, 1) 
                : ($jmlRealisasi > 0 ? 999 : 0);

            // Status: Hemat (<100%), Sesuai (=100%), Boros (>100%)
            $status = 'Sesuai';
            if ($efisiensiPersen < 100) $status = 'Hemat';
            if ($efisiensiPersen > 100) $status = 'Boros';

            $data[] = [
                'barang_id' => $barangId,
                'nama_barang' => $barang->nama_barang,
                'satuan' => $barang->satuan->nama ?? '-',
                'jumlah_rencana' => $jmlRencana,
                'jumlah_realisasi' => $jmlRealisasi,
                'efisiensi_persen' => $efisiensiPersen,
                'selisih' => $selisih,
                'status' => $status,
            ];

            $totalRencana += $jmlRencana;
            $totalRealisasi += $jmlRealisasi;
            if ($jmlRencana > 0) {
                $efisiensiList[] = $efisiensiPersen;
            }
        }

        $rataRataEfisiensi = count($efisiensiList) > 0 
            ? round(array_sum($efisiensiList) / count($efisiensiList), 1) 
            : 0;

        return response()->json([
            'data' => $data,
            'summary' => [
                'rata_rata_efisiensi' => $rataRataEfisiensi,
                'total_rencana' => $totalRencana,
                'total_realisasi' => $totalRealisasi,
                'total_barang' => count($data),
            ],
        ]);
    }

    /**
     * Laporan Stok untuk Audit
     * GET /api/laporan/stok-audit?kategori_id=&lokasi_id=
     */
    public function stokAudit(Request $request)
    {
        $query = Barang::with(['kategori', 'satuan', 'lokasi', 'batchBarang' => function ($q) {
            $q->orderBy('tgl_kadaluarsa', 'asc');
        }]);

        // Optional filters
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }
        if ($request->filled('lokasi_id')) {
            $query->where('lokasi_id', $request->lokasi_id);
        }

        $barangList = $query->get();

        $totalStokMenipis = 0;
        $totalKadaluarsa = 0;
        $totalNilaiInventaris = 0;

        $data = $barangList->map(function ($barang) use (&$totalStokMenipis, &$totalKadaluarsa, &$totalNilaiInventaris) {
            $totalStok = $barang->total_stok ?? $barang->batchBarang->sum('stok_tersisa');

            // Status stok
            $statusStok = 'Aman';
            if ($barang->stok_minimum && $totalStok <= $barang->stok_minimum) {
                $statusStok = 'Menipis';
                $totalStokMenipis++;
            }
            if ($totalStok <= 0) {
                $statusStok = 'Habis';
            }

            // Check kadaluarsa
            $batchKadaluarsa = $barang->batchBarang->filter(function ($batch) {
                return $batch->tgl_kadaluarsa && Carbon::parse($batch->tgl_kadaluarsa)->isPast();
            })->count();
            if ($batchKadaluarsa > 0) $totalKadaluarsa++;

            // Hitung nilai inventaris
            $nilaiBarang = $barang->batchBarang->sum(function ($batch) {
                return (float) ($batch->harga_satuan ?? 0) * (float) ($batch->stok_tersisa ?? 0);
            });
            $totalNilaiInventaris += $nilaiBarang;

            $batches = $barang->batchBarang->map(function ($batch) {
                $isExpired = $batch->tgl_kadaluarsa && Carbon::parse($batch->tgl_kadaluarsa)->isPast();
                return [
                    'id' => $batch->id,
                    'kode_batch' => $batch->kode_batch,
                    'stok_tersisa' => (float) $batch->stok_tersisa,
                    'tgl_kadaluarsa' => $batch->tgl_kadaluarsa,
                    'is_expired' => $isExpired,
                    'status_batch' => $batch->status_batch,
                    'kondisi' => $batch->kondisi,
                    'harga_satuan' => (float) ($batch->harga_satuan ?? 0),
                ];
            });

            return [
                'barang_id' => $barang->id,
                'kode_barang' => $barang->kode_barang,
                'nama_barang' => $barang->nama_barang,
                'kategori' => $barang->kategori->nama ?? '-',
                'satuan' => $barang->satuan->nama ?? '-',
                'total_stok' => (float) $totalStok,
                'stok_minimum' => (float) ($barang->stok_minimum ?? 0),
                'status_stok' => $statusStok,
                'lokasi' => $barang->lokasi->nama ?? '-',
                'batches' => $batches,
                'jumlah_batch' => $batches->count(),
                'batch_kadaluarsa' => $batchKadaluarsa,
                'total_nilai' => $nilaiBarang,
            ];
        });

        return response()->json([
            'data' => $data,
            'summary' => [
                'total_jenis_barang' => $barangList->count(),
                'total_stok_menipis' => $totalStokMenipis,
                'total_kadaluarsa' => $totalKadaluarsa,
                'total_nilai_inventaris' => $totalNilaiInventaris,
            ],
        ]);
    }
}
