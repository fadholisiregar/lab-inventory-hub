<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgramStudi;
use Illuminate\Http\Request;

class ProgramStudiController extends Controller
{
    public function index()
    {
        return response()->json(ProgramStudi::orderBy('nama')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'nullable|string',
            'nama' => 'required|string|unique:program_studi,nama',
        ]);
        $data = ProgramStudi::create($validated);
        return response()->json(['message' => 'Program studi berhasil ditambahkan', 'data' => $data], 201);
    }

    public function show(ProgramStudi $programStudi)
    {
        return response()->json($programStudi);
    }

    public function update(Request $request, ProgramStudi $programStudi)
    {
        $validated = $request->validate([
            'kode' => 'nullable|string',
            'nama' => 'required|string|unique:program_studi,nama,' . $programStudi->id,
        ]);
        $programStudi->update($validated);
        return response()->json(['message' => 'Program studi berhasil diperbarui', 'data' => $programStudi]);
    }

    public function destroy(ProgramStudi $programStudi)
    {
        if ($programStudi->mataKuliah()->exists()) {
            return response()->json(['message' => 'Tidak dapat dihapus karena masih dipakai pada mata kuliah.'], 400);
        }
        $programStudi->delete();
        return response()->json(['message' => 'Program studi berhasil dihapus']);
    }
}
