<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModulPraktikum;
use Illuminate\Http\Request;

class ModulPraktikumController extends Controller
{
    public function index(Request $request)
    {
        $query = ModulPraktikum::with('mataKuliah')->orderBy('nama');
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'mata_kuliah_id' => 'nullable|exists:mata_kuliah,id',
        ]);
        $data = ModulPraktikum::create($validated);
        return response()->json(['message' => 'Modul praktikum berhasil ditambahkan', 'data' => $data->load('mataKuliah')], 201);
    }

    public function show(ModulPraktikum $modulPraktikum)
    {
        return response()->json($modulPraktikum->load('mataKuliah'));
    }

    public function update(Request $request, ModulPraktikum $modulPraktikum)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'mata_kuliah_id' => 'nullable|exists:mata_kuliah,id',
        ]);
        $modulPraktikum->update($validated);
        return response()->json(['message' => 'Modul praktikum berhasil diperbarui', 'data' => $modulPraktikum->load('mataKuliah')]);
    }

    public function destroy(ModulPraktikum $modulPraktikum)
    {
        $modulPraktikum->delete();
        return response()->json(['message' => 'Modul praktikum berhasil dihapus']);
    }
}
