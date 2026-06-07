<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriBarang;
use Illuminate\Http\Request;

class KategoriBarangController extends Controller
{
    public function index(Request $request)
    {
        $query = KategoriBarang::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('kode', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%");
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->orderBy('nama')->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:kategori_barang,kode',
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $kategori = KategoriBarang::create($validated);
        return response()->json(['message' => 'Kategori berhasil ditambahkan', 'data' => $kategori], 201);
    }

    public function show(KategoriBarang $kategori_barang)
    {
        return response()->json($kategori_barang);
    }

    public function update(Request $request, KategoriBarang $kategori_barang)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:kategori_barang,kode,' . $kategori_barang->id,
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $kategori_barang->update($validated);
        return response()->json(['message' => 'Kategori berhasil diperbarui', 'data' => $kategori_barang]);
    }

    public function destroy(KategoriBarang $kategori_barang)
    {
        if ($kategori_barang->masterBarang()->exists()) {
             return response()->json(['message' => 'Kategori tidak dapat dihapus karena digunakan oleh master barang.'], 400);
        }
        $kategori_barang->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
