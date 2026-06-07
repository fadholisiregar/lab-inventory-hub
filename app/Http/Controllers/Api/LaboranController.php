<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetailRpb;
use App\Models\RencanaPengambilanBahan;
use Illuminate\Http\Request;
use App\Models\Laboran;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class LaboranController extends Controller
{
    public function index(Request $request)
    {
        $query = Laboran::with('user');

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('nomor_hp', 'like', "%{$search}%");
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'nomor_hp' => 'nullable|string|max:20',
            'pic_labs' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $role = Role::where('name', 'Laboran')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            $laboran = Laboran::create([
                'user_id' => $user->id,
                'nomor_hp' => $validated['nomor_hp'] ?? null,
                'pic_labs' => $validated['pic_labs'] ?? [],
            ]);

            DB::commit();
            return response()->json(['message' => 'Laboran berhasil ditambahkan', 'data' => $laboran->load('user')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan laboran', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Laboran $laboran)
    {
        return response()->json($laboran->load('user'));
    }

    public function update(Request $request, Laboran $laboran)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $laboran->user_id,
            'password' => 'nullable|string|min:8',
            'nomor_hp' => 'nullable|string|max:20',
            'pic_labs' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();

            $user = $laboran->user;
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }
            $user->update($userData);

            $laboran->update([
                'nomor_hp' => $validated['nomor_hp'] ?? null,
                'pic_labs' => $validated['pic_labs'] ?? [],
            ]);

            DB::commit();
            return response()->json(['message' => 'Laboran berhasil diperbarui', 'data' => $laboran->load('user')]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui laboran'], 500);
        }
    }

    public function destroy(Laboran $laboran)
    {
        try {
            DB::beginTransaction();
            $user = $laboran->user;
            $laboran->delete();
            $user->delete(); 
            DB::commit();
            return response()->json(['message' => 'Laboran berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus laboran'], 500);
        }
    }

    public function ajukanRPB(Request $request)
    {
        $validated = $request->validate([
            'laboran_id' => 'required|exists:users,id',
            'jadwal_praktikum' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah_diminta' => 'required|integer|min:1',
        ]);

        try {
            $rpb = DB::transaction(function () use ($validated) {
                // Buat RPB
                $rpb = RencanaPengambilanBahan::create([
                    'laboran_id' => $validated['laboran_id'],
                    'jadwal_praktikum' => $validated['jadwal_praktikum'],
                    'status' => 'pending',
                ]);

                // Buat Detail RPB
                foreach ($validated['items'] as $item) {
                    DetailRpb::create([
                        'rpb_id' => $rpb->id,
                        'barang_id' => $item['barang_id'],
                        'jumlah_diminta' => $item['jumlah_diminta'],
                    ]);
                }

                return $rpb->load('detailRpb');
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Rencana Pengambilan Bahan berhasil diajukan.',
                'data' => $rpb
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengajukan RPB: ' . $e->getMessage()
            ], 500);
        }
    }
}
