<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PetugasGudang;
use App\Models\Laboran;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PetugasGudangController extends Controller
{
    public function index(Request $request)
    {
        $query = PetugasGudang::with(['laboran.user', 'kategoriRumpun']);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('laboran.user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('kategoriRumpun', function($q) use ($search) {
                  $q->where('nama_rumpun', 'like', "%{$search}%");
              });
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'laboran_id' => 'required|exists:laboran,id|unique:petugas_gudang,laboran_id',
            'kategori_rumpun_id' => 'nullable|exists:kategori_rumpun,id|unique:petugas_gudang,kategori_rumpun_id',
        ], [
            'laboran_id.unique' => 'Laboran ini sudah menjabat sebagai petugas gudang.',
            'kategori_rumpun_id.unique' => 'Kategori Rumpun ini sudah memiliki petugas.'
        ]);

        try {
            DB::beginTransaction();

            $laboran = Laboran::with('user')->find($validated['laboran_id']);
            $validated['user_id'] = $laboran->user_id;

            $petugasGudang = PetugasGudang::create($validated);

            $role = Role::where('name', 'Petugas Gudang')->first();
            if ($role && $laboran->user) {
                $laboran->user->roles()->syncWithoutDetaching([$role->id]);
            }

            DB::commit();
            return response()->json(['message' => 'Petugas Gudang berhasil ditambahkan', 'data' => $petugasGudang->load(['laboran.user', 'kategoriRumpun'])], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan Petugas Gudang', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(PetugasGudang $petugasGudang)
    {
        return response()->json($petugasGudang->load(['laboran.user', 'kategoriRumpun']));
    }

    public function update(Request $request, PetugasGudang $petugasGudang)
    {
        $validated = $request->validate([
            'kategori_rumpun_id' => 'nullable|exists:kategori_rumpun,id|unique:petugas_gudang,kategori_rumpun_id,' . $petugasGudang->id,
        ], [
            'kategori_rumpun_id.unique' => 'Kategori Rumpun ini sudah memiliki petugas.'
        ]);

        try {
            DB::beginTransaction();

            $petugasGudang->update([
                'kategori_rumpun_id' => $validated['kategori_rumpun_id'] ?? null,
            ]);

            DB::commit();
            return response()->json(['message' => 'Petugas Gudang berhasil diperbarui', 'data' => $petugasGudang->load(['laboran.user', 'kategoriRumpun'])]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui Petugas Gudang', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(PetugasGudang $petugasGudang)
    {
        try {
            DB::beginTransaction();
            $laboran = Laboran::with('user')->find($petugasGudang->laboran_id);
            $role = Role::where('name', 'Petugas Gudang')->first();
            if ($role && $laboran && $laboran->user) {
                $laboran->user->roles()->detach($role->id);
            }

            $petugasGudang->delete();
            DB::commit();
            return response()->json(['message' => 'Petugas Gudang berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus Petugas Gudang'], 500);
        }
    }
}
