<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with(['kategori', 'satuan', 'lokasi']);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('kode_barang', 'like', "%{$search}%")
                  ->orWhere('nama_barang', 'like', "%{$search}%");
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
            'satuan_id' => 'required|exists:satuans,id',
            'lokasi_id' => 'nullable|exists:lokasi_penyimpanan,id',
            'stok_minimum' => 'required|integer|min:0',
            'sifat_bahan' => 'nullable|string',
            'perlu_kadaluarsa' => 'boolean',
            'spesifikasi' => 'nullable|string',
        ]);

        $barang = Barang::create($validated);
        return response()->json($barang, 201);
    }

    public function show(Barang $barang)
    {
        $barang->load(['kategori', 'satuan', 'lokasi']);
        return response()->json($barang);
    }

    public function update(Request $request, Barang $barang)
    {
        $validated = $request->validate([
            'kode_barang' => 'required|string|unique:barang,kode_barang,' . $barang->id,
            'nama_barang' => 'required|string',
            'kategori_id' => 'nullable|exists:kategori_barang,id',
            'satuan_id' => 'required|exists:satuans,id',
            'lokasi_id' => 'nullable|exists:lokasi_penyimpanan,id',
            'stok_minimum' => 'required|integer|min:0',
            'sifat_bahan' => 'nullable|string',
            'perlu_kadaluarsa' => 'boolean',
            'spesifikasi' => 'nullable|string',
        ]);

        $barang->update($validated);
        return response()->json($barang);
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
