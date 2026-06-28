<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaKebutuhanItem;
use Illuminate\Http\Request;

/**
 * Pengadaan Bahan Praktikum = item rencana kebutuhan yang stoknya kurang
 * (status_item = 'Perlu Pengadaan') dari rencana yang sudah diajukan.
 * Laboran melengkapi harga penawaran, penyedia, dan status pengadaan.
 */
class PengadaanPraktikumController extends Controller
{
    private array $relations = [
        'rencana.programStudi', 'rencana.mataKuliah', 'rencana.modulPraktikum',
        'barang.satuan', 'penyedia',
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $query = RencanaKebutuhanItem::with($this->relations)
            ->where('status_item', 'Perlu Pengadaan')
            ->whereHas('rencana', fn ($q) => $q->where('status', '!=', 'Draft'))
            ->orderByDesc('created_at');

        if ($user->hasRole('Laboran') && !$user->hasRole('Koordinator Gudang')) {
            $query->whereHas('rencana', fn ($q) => $q->where('created_by', $user->id));
        }

        return response()->json($query->get());
    }

    public function update(Request $request, RencanaKebutuhanItem $item)
    {
        $validated = $request->validate([
            'harga_penawaran' => 'nullable|numeric|min:0',
            'penyedia_id'     => 'nullable|exists:penyedia,id',
            'status_pengadaan' => 'nullable|in:Diajukan,Disetujui,Ditolak,Selesai',
        ]);

        $item->update($validated);
        return response()->json(['message' => 'Pengadaan diperbarui.', 'data' => $item->load($this->relations)]);
    }
}
