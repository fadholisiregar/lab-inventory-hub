<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use Illuminate\Http\Request;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $query = MataKuliah::with('programStudi')->orderBy('nama');
        if ($request->filled('program_studi_id')) {
            $query->where('program_studi_id', $request->program_studi_id);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'nullable|string',
            'nama' => 'required|string',
            'program_studi_id' => 'nullable|exists:program_studi,id',
        ]);
        $data = MataKuliah::create($validated);
        return response()->json(['message' => 'Mata kuliah berhasil ditambahkan', 'data' => $data->load('programStudi')], 201);
    }

    public function show(MataKuliah $mataKuliah)
    {
        return response()->json($mataKuliah->load('programStudi'));
    }

    public function update(Request $request, MataKuliah $mataKuliah)
    {
        $validated = $request->validate([
            'kode' => 'nullable|string',
            'nama' => 'required|string',
            'program_studi_id' => 'nullable|exists:program_studi,id',
        ]);
        $mataKuliah->update($validated);
        return response()->json(['message' => 'Mata kuliah berhasil diperbarui', 'data' => $mataKuliah->load('programStudi')]);
    }

    public function destroy(MataKuliah $mataKuliah)
    {
        if ($mataKuliah->modulPraktikum()->exists()) {
            return response()->json(['message' => 'Tidak dapat dihapus karena masih dipakai pada modul praktikum.'], 400);
        }
        $mataKuliah->delete();
        return response()->json(['message' => 'Mata kuliah berhasil dihapus']);
    }
}
