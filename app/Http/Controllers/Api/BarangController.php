<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with([
            'kategori',
            'satuan',
            'lokasi',
            'sifatBahan',
            'batchBarang' => function ($q) {
                $q->where('stok_tersisa', '>', 0)
                  ->where('status_batch', 'Aktif')
                  ->orderByRaw('tgl_kadaluarsa ASC NULLS LAST, tgl_penerimaan ASC');
            }
        ]);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_barang', 'ilike', "%{$search}%")
                  ->orWhere('nama_barang', 'ilike', "%{$search}%");
            });
        }
        
        if ($request->has('kategori_id') && $request->kategori_id != '') {
            $query->where('kategori_id', $request->kategori_id);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->orderBy('nama_barang')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|unique:barang,kode_barang',
            'nama_barang' => 'required|string',
            'kategori_id' => 'nullable|exists:kategori_barang,id',
            'satuan_id' => 'required|exists:satuan,id',
            'lokasi_id' => 'nullable|exists:lokasi_penyimpanan,id',
            'stok_minimum' => 'required|numeric|min:0',
            'sifat_bahan_ids' => 'nullable|array',
            'sifat_bahan_ids.*' => 'exists:sifat_bahan,id',
            'perlu_kadaluarsa' => 'nullable|boolean',
            'spesifikasi' => 'nullable|string',
            'harga' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $barang = Barang::create($validated);
        
        if ($request->has('sifat_bahan_ids')) {
            $barang->sifatBahan()->sync($request->sifat_bahan_ids);
        }

        return response()->json($barang->load('sifatBahan'), 201);
    }

    public function show(Barang $barang)
    {
        $barang->load(['kategori', 'satuan', 'lokasi', 'sifatBahan']);
        return response()->json($barang);
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|unique:barang,kode_barang,' . $barang->id,
            'nama_barang' => 'required|string',
            'kategori_id' => 'nullable|exists:kategori_barang,id',
            'satuan_id' => 'required|exists:satuan,id',
            'lokasi_id' => 'nullable|exists:lokasi_penyimpanan,id',
            'stok_minimum' => 'required|numeric|min:0',
            'sifat_bahan_ids' => 'nullable|array',
            'sifat_bahan_ids.*' => 'exists:sifat_bahan,id',
            'perlu_kadaluarsa' => 'nullable|boolean',
            'spesifikasi' => 'nullable|string',
            'harga' => 'nullable|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $barang->update($validated);
        
        if ($request->has('sifat_bahan_ids')) {
            $barang->sifatBahan()->sync($request->sifat_bahan_ids);
        }

        return response()->json($barang->load('sifatBahan'));
    }

    public function destroy(Barang $barang)
    {
        try {
            $barang->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Barang tidak bisa dihapus karena masih digunakan.'], 400);
        }
    }
}
