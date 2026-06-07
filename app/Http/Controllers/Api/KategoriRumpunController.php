<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriRumpun;
use Illuminate\Http\Request;

class KategoriRumpunController extends Controller
{
    public function index(Request $request)
    {
        $query = KategoriRumpun::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('nama_rumpun', 'like', "%{$search}%");
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->orderBy('nama_rumpun')->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_rumpun' => 'required|string|max:50|unique:kategori_rumpun,kode_rumpun',
            'nama_rumpun' => 'required|string|max:255|unique:kategori_rumpun,nama_rumpun',
            'keterangan' => 'nullable|string',
        ]);

        $kategoriRumpun = KategoriRumpun::create($validated);
        return response()->json(['message' => 'Kategori Rumpun berhasil ditambahkan', 'data' => $kategoriRumpun], 201);
    }

    public function show(KategoriRumpun $kategoriRumpun)
    {
        return response()->json($kategoriRumpun);
    }

    public function update(Request $request, KategoriRumpun $kategoriRumpun)
    {
        $validated = $request->validate([
            'kode_rumpun' => 'required|string|max:50|unique:kategori_rumpun,kode_rumpun,' . $kategoriRumpun->id,
            'nama_rumpun' => 'required|string|max:255|unique:kategori_rumpun,nama_rumpun,' . $kategoriRumpun->id,
            'keterangan' => 'nullable|string',
        ]);

        $kategoriRumpun->update($validated);
        return response()->json(['message' => 'Kategori Rumpun berhasil diperbarui', 'data' => $kategoriRumpun]);
    }

    public function destroy(KategoriRumpun $kategoriRumpun)
    {
        $kategoriRumpun->delete();
        return response()->json(['message' => 'Kategori Rumpun berhasil dihapus']);
    }
}
