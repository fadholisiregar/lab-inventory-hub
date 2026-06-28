<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\RencanaKebutuhan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RencanaKebutuhanController extends Controller
{
    private array $relations = [
        'programStudi', 'mataKuliah', 'modulPraktikum', 'periodeAkademik',
        'items.barang.satuan', 'items.penyedia', 'creator',
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $query = RencanaKebutuhan::with($this->relations)->orderByDesc('created_at');

        if ($user->hasRole('Laboran') && !$user->hasRole('Koordinator Gudang')) {
            $query->where('created_by', $user->id);
        }

        return response()->json($query->get());
    }

    public function show(RencanaKebutuhan $rencanaKebutuhan)
    {
        return response()->json($rencanaKebutuhan->load($this->relations));
    }

    public function store(Request $request)
    {
        $validated = $this->validateData($request);

        DB::beginTransaction();
        try {
            $rencana = RencanaKebutuhan::create([
                'program_studi_id'    => $validated['program_studi_id'],
                'mata_kuliah_id'      => $validated['mata_kuliah_id'],
                'modul_praktikum_id'  => $validated['modul_praktikum_id'],
                'periode_akademik_id' => $validated['periode_akademik_id'] ?? optional(\App\Models\PeriodeAkademik::where('is_aktif', true)->first())->id,
                'status'              => $validated['status'],
            ]);

            foreach ($validated['items'] ?? [] as $row) {
                $rencana->items()->create($this->buildItem($row));
            }

            DB::commit();
            return response()->json(['message' => 'Rencana kebutuhan disimpan.', 'data' => $rencana->load($this->relations)], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan data.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, RencanaKebutuhan $rencanaKebutuhan)
    {
        $validated = $this->validateData($request);

        DB::beginTransaction();
        try {
            $rencanaKebutuhan->update([
                'program_studi_id'    => $validated['program_studi_id'],
                'mata_kuliah_id'      => $validated['mata_kuliah_id'],
                'modul_praktikum_id'  => $validated['modul_praktikum_id'],
                'periode_akademik_id' => $validated['periode_akademik_id'] ?? $rencanaKebutuhan->periode_akademik_id,
                'status'              => $validated['status'],
            ]);

            // Sinkron item by id (pertahankan field pengadaan utk item yang tetap ada).
            $keepIds = [];
            foreach ($validated['items'] ?? [] as $row) {
                $payload = $this->buildItem($row);
                if (!empty($row['id'])) {
                    $item = $rencanaKebutuhan->items()->find($row['id']);
                    if ($item) {
                        $item->update($payload);
                        $keepIds[] = $item->id;
                        continue;
                    }
                }
                $new = $rencanaKebutuhan->items()->create($payload);
                $keepIds[] = $new->id;
            }
            $rencanaKebutuhan->items()->whereNotIn('id', $keepIds)->delete();

            DB::commit();
            return response()->json(['message' => 'Rencana kebutuhan diperbarui.', 'data' => $rencanaKebutuhan->load($this->relations)]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui data.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(RencanaKebutuhan $rencanaKebutuhan)
    {
        $rencanaKebutuhan->delete(); // item ikut terhapus (cascade)
        return response()->json(['message' => 'Rencana kebutuhan dihapus.']);
    }

    private function validateData(Request $request): array
    {
        $data = $request->validate([
            'program_studi_id'         => 'required|exists:program_studi,id',
            'mata_kuliah_id'           => 'required|exists:mata_kuliah,id',
            'modul_praktikum_id'       => 'required|exists:modul_praktikum,id',
            'periode_akademik_id'      => 'nullable|exists:periode_akademik,id',
            'status'                   => 'nullable|in:Draft,Diajukan,Selesai',
            'items'                    => 'nullable|array',
            'items.*.id'               => 'nullable|integer',
            'items.*.barang_id'        => 'required|exists:barang,id',
            'items.*.jumlah_pengajuan' => 'required|numeric|min:0.001',
        ]);

        $data['status'] = $data['status'] ?? 'Draft';

        // Bila bukan draft, wajib ada minimal 1 item.
        if ($data['status'] !== 'Draft' && empty($data['items'])) {
            abort(response()->json([
                'message' => 'Minimal 1 bahan harus diisi sebelum diajukan.',
                'errors' => ['items' => ['Minimal 1 bahan harus diisi.']],
            ], 422));
        }

        return $data;
    }

    private function buildItem(array $row): array
    {
        $barang = Barang::find($row['barang_id']);
        $stok = (float) ($barang->total_stok ?? 0);
        $jumlah = (float) $row['jumlah_pengajuan'];

        return [
            'barang_id'           => $row['barang_id'],
            'jumlah_pengajuan'    => $jumlah,
            'stok_saat_pengajuan' => $stok,
            'status_item'         => $stok >= $jumlah ? 'Cukup' : 'Perlu Pengadaan',
        ];
    }
}
