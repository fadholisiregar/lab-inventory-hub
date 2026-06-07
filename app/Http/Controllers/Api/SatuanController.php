<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satuan;
use Illuminate\Http\Request;

class SatuanController extends Controller
{
    public function index(Request $request)
    {
        $query = Satuan::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('simbol', 'like', "%{$search}%")
                  ->orWhere('nama_satuan', 'like', "%{$search}%");
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->orderBy('nama_satuan')->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'simbol' => 'required|string|max:50|unique:satuans,simbol',
            'nama_satuan' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $satuan = Satuan::create($validated);
        return response()->json(['message' => 'Satuan berhasil ditambahkan', 'data' => $satuan], 201);
    }

    public function show(Satuan $satuan)
    {
        return response()->json($satuan);
    }

    public function update(Request $request, Satuan $satuan)
    {
        $validated = $request->validate([
            'simbol' => 'required|string|max:50|unique:satuan,simbol,' . $satuan->id,
            'nama_satuan' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $satuan->update($validated);
        return response()->json(['message' => 'Satuan berhasil diperbarui', 'data' => $satuan]);
    }

    public function destroy(Satuan $satuan)
    {
        $satuan->delete();
        return response()->json(['message' => 'Satuan berhasil dihapus']);
    }
}
