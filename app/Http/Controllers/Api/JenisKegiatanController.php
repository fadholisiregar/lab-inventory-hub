<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisKegiatan;
use Illuminate\Http\Request;

class JenisKegiatanController extends Controller
{
    public function index(Request $request)
    {
        $query = JenisKegiatan::orderBy('nama');
        if ($request->boolean('aktif')) {
            $query->where('aktif', true);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        $jenis = JenisKegiatan::create($validated);
        return response()->json(['message' => 'Jenis kegiatan berhasil ditambahkan', 'data' => $jenis], 201);
    }

    public function show(JenisKegiatan $jenisKegiatan)
    {
        return response()->json($jenisKegiatan);
    }

    public function update(Request $request, JenisKegiatan $jenisKegiatan)
    {
        $validated = $request->validate($this->rules($jenisKegiatan->id));
        $jenisKegiatan->update($validated);
        return response()->json(['message' => 'Jenis kegiatan berhasil diperbarui', 'data' => $jenisKegiatan]);
    }

    public function destroy(JenisKegiatan $jenisKegiatan)
    {
        if ($jenisKegiatan->penerimaan()->exists()) {
            return response()->json(['message' => 'Jenis kegiatan tidak dapat dihapus karena sudah dipakai pada penerimaan.'], 400);
        }
        $jenisKegiatan->delete();
        return response()->json(['message' => 'Jenis kegiatan berhasil dihapus']);
    }

    private function rules(?int $ignoreId = null): array
    {
        return [
            'nama' => 'required|string|unique:jenis_kegiatan,nama' . ($ignoreId ? ',' . $ignoreId : ''),
            'wajib_link_pengadaan' => 'nullable|boolean',
            'aktif' => 'nullable|boolean',
        ];
    }
}
