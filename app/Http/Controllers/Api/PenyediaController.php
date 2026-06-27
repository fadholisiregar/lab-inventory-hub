<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penyedia;
use Illuminate\Http\Request;

class PenyediaController extends Controller
{
    public function index()
    {
        return response()->json(Penyedia::orderBy('kode_penyedia')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate(
            $this->validationRules(),
            $this->validationMessages()
        );

        $penyedia = Penyedia::create($validated);
        return response()->json(['message' => 'Penyedia berhasil ditambahkan', 'data' => $penyedia], 201);
    }

    public function show(Penyedia $penyedia)
    {
        return response()->json($penyedia);
    }

    public function update(Request $request, Penyedia $penyedia)
    {
        $validated = $request->validate(
            $this->validationRules($penyedia->id),
            $this->validationMessages()
        );

        $penyedia->update($validated);
        return response()->json(['message' => 'Penyedia berhasil diperbarui', 'data' => $penyedia]);
    }

    public function destroy(Penyedia $penyedia)
    {
        if ($penyedia->batchBarang()->exists()) {
            return response()->json(['message' => 'Penyedia tidak dapat dihapus karena sudah dipakai pada batch barang.'], 400);
        }
        $penyedia->delete();
        return response()->json(['message' => 'Penyedia berhasil dihapus']);
    }

    private function validationRules(?int $ignoreId = null): array
    {
        $unique = 'unique:penyedia,kode_penyedia' . ($ignoreId ? ',' . $ignoreId : '');
        return [
            'kode_penyedia' => ['required', 'string', 'regex:/^VND-\d{3}-[A-Za-z0-9]{3}$/', $unique],
            'nama_penyedia' => 'required|string',
            'kontak' => 'nullable|string',
            'alamat' => 'nullable|string',
        ];
    }

    private function validationMessages(): array
    {
        return [
            'kode_penyedia.regex' => 'Format kode penyedia harus VND-000-XXX (contoh: VND-001-ABC).',
            'kode_penyedia.unique' => 'Kode penyedia sudah digunakan.',
        ];
    }
}
