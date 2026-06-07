<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Models\MasterBarang;

class ReportService
{
    /**
     * Dapatkan Laporan Rekap Transaksi per Periode
     * Barang paling sering diminta diurutkan berdasarkan jumlah keluar.
     *
     * @param string $startDate (Format: Y-m-d)
     * @param string $endDate (Format: Y-m-d)
     * @return \Illuminate\Support\Collection
     */
    public function getRekapTransaksiPerPeriode($startDate, $endDate)
    {
        return MasterBarang::select(
                'master_barangs.id',
                'master_barangs.kode_barang',
                'master_barangs.nama_barang',
                'master_barangs.satuan',
                DB::raw('SUM(detail_transaksis.jumlah_keluar) as total_keluar'),
                DB::raw('COUNT(DISTINCT transaksis.id) as frekuensi_transaksi')
            )
            ->join('batch_barangs', 'master_barangs.id', '=', 'batch_barangs.barang_id')
            ->join('detail_transaksis', 'batch_barangs.id', '=', 'detail_transaksis.batch_barang_id')
            ->join('transaksis', 'detail_transaksis.transaksi_id', '=', 'transaksis.id')
            ->whereBetween('transaksis.tgl_eksekusi', [$startDate, $endDate])
            ->groupBy('master_barangs.id', 'master_barangs.kode_barang', 'master_barangs.nama_barang', 'master_barangs.satuan')
            ->orderBy('total_keluar', 'DESC')
            ->get();
    }
}
