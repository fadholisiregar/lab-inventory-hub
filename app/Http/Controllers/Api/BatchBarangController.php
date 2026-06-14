<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BatchBarang;

class BatchBarangController extends Controller
{
    /**
     * Search for active batch barang by master barang name.
     */
    public function search(Request $request)
    {
        $query = BatchBarang::with('masterBarang.satuan')
            ->where('status_batch', 'Aktif')
            ->where('stok_tersisa', '>', 0);

        if ($request->has('q') && $request->q != '') {
            $searchTerm = $request->q;
            $query->whereHas('masterBarang', function($q) use ($searchTerm) {
                $q->where('nama_barang', 'ilike', '%' . $searchTerm . '%')
                  ->orWhere('kode_barang', 'ilike', '%' . $searchTerm . '%');
            });
        }

        $batches = $query->orderByRaw('tgl_kadaluarsa ASC NULLS LAST, tgl_penerimaan ASC')
            ->limit(15)
            ->get();

        $mapped = $batches->map(function ($batch) {
            $namaBarang = $batch->masterBarang ? $batch->masterBarang->nama_barang : 'Unknown';
            $satuan = ($batch->masterBarang && $batch->masterBarang->satuan) ? $batch->masterBarang->satuan->nama_satuan : 'Unit';
            return [
                'id' => $batch->id,
                'label' => $namaBarang . ' (Stok: ' . $batch->stok_tersisa . ' ' . $satuan . ')',
                'nama_barang' => $namaBarang,
                'kode_batch' => $batch->kode_batch,
                'stok_tersisa' => $batch->stok_tersisa,
                'satuan' => $satuan,
                'tgl_kadaluarsa' => $batch->tgl_kadaluarsa
            ];
        });

        return response()->json($mapped);
    }
}
