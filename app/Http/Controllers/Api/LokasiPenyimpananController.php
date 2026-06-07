<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LokasiPenyimpanan;
use Illuminate\Http\Request;

class LokasiPenyimpananController extends Controller
{
    public function index()
    {
        $lokasi = LokasiPenyimpanan::latest()->get();
        return response()->json($lokasi);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:lokasi_penyimpanan,kode',
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $lokasi = LokasiPenyimpanan::create($validated);
        return response()->json(['message' => 'Lokasi berhasil ditambahkan', 'data' => $lokasi], 201);
    }

    public function show(LokasiPenyimpanan $lokasiPenyimpanan)
    {
        return response()->json($lokasiPenyimpanan);
    }

    public function update(Request $request, LokasiPenyimpanan $lokasiPenyimpanan)
    {
        $validated = $request->validate([
            'kode' => 'required|string|unique:lokasi_penyimpanan,kode,' . $lokasiPenyimpanan->id,
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $lokasiPenyimpanan->update($validated);
        return response()->json(['message' => 'Lokasi berhasil diperbarui', 'data' => $lokasiPenyimpanan]);
    }

    public function destroy(LokasiPenyimpanan $lokasiPenyimpanan)
    {
        if ($lokasiPenyimpanan->masterBarang()->exists()) {
             return response()->json(['message' => 'Lokasi tidak dapat dihapus karena sedang digunakan pada master barang.'], 400);
        }
        $lokasiPenyimpanan->delete();
        return response()->json(['message' => 'Lokasi berhasil dihapus']);
    }
}
