<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StatusTransaksi;
use Illuminate\Http\Request;

class StatusTransaksiController extends Controller
{
    public function index(Request $request)
    {
        $query = StatusTransaksi::query();
        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                  ->orWhere('kode', 'like', "%{$request->search}%");
            });
        }
        if ($request->has('kategori') && $request->kategori != '') {
            $query->where('kategori', $request->kategori);
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->orderBy('kode')->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->orderBy('kode')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'required|in:Masuk,Keluar',
            'kode' => 'required|string|unique:status_transaksi,kode',
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $status = StatusTransaksi::create($validated);
        return response()->json($status, 201);
    }

    public function show(StatusTransaksi $status)
    {
        return response()->json($status);
    }

    public function update(Request $request, $id)
    {
        $status = StatusTransaksi::findOrFail($id);
        $validated = $request->validate([
            'kategori' => 'required|in:Masuk,Keluar',
            'kode' => 'required|string|unique:status_transaksi,kode,' . $status->id,
            'nama' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        $status->update($validated);
        return response()->json($status);
    }

    public function destroy($id)
    {
        $status = StatusTransaksi::findOrFail($id);
        try {
            $status->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Status tidak bisa dihapus karena masih digunakan.'], 400);
        }
    }
}
