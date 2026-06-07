<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaPengambilanBahan;
use App\Models\Koordinator;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KoordinatorController extends Controller
{
    public function index(Request $request)
    {
        $query = Koordinator::with(['user']);

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
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $role = Role::where('name', 'Koordinator Gudang')->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }

            $koordinator = Koordinator::create([
                'user_id' => $user->id,
                'nomor_hp' => $validated['nomor_hp'] ?? null,
            ]);

            DB::commit();
            return response()->json(['message' => 'Koordinator berhasil ditambahkan', 'data' => $koordinator->load('user')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan koordinator', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Koordinator $koordinator)
    {
        return response()->json($koordinator->load(['user']));
    }

    public function update(Request $request, Koordinator $koordinator)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $koordinator->user_id,
            'password' => 'nullable|string|min:8',
            'nomor_hp' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $user = $koordinator->user;
            $userData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }
            $user->update($userData);

            $koordinator->update([
                'nomor_hp' => $validated['nomor_hp'] ?? null,
            ]);

            DB::commit();
            return response()->json(['message' => 'Koordinator berhasil diperbarui', 'data' => $koordinator->load('user')]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui koordinator', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Koordinator $koordinator)
    {
        try {
            DB::beginTransaction();
            
            $user = $koordinator->user;
            $koordinator->delete();
            if ($user) {
                $role = Role::where('name', 'Koordinator Gudang')->first();
                if ($role) {
                    $user->roles()->detach($role->id);
                }
            }
            
            DB::commit();
            return response()->json(['message' => 'Koordinator berhasil dihapus']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus koordinator'], 500);
        }
    }

    public function reviewRPB(Request $request, $id)
    {
        $validated = $request->validate([
            'koordinator_id' => 'required|exists:users,id',
            'status' => 'required|in:approved,rejected',
            'alasan_penolakan' => 'required_if:status,rejected|string|nullable'
        ]);

        $rpb = RencanaPengambilanBahan::findOrFail($id);

        if ($rpb->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'RPB ini sudah direview sebelumnya.'
            ], 400);
        }

        $rpb->status = $validated['status'];
        $rpb->koordinator_id = $validated['koordinator_id'];
        
        if ($validated['status'] === 'rejected') {
            $rpb->alasan_penolakan = $validated['alasan_penolakan'];
        }
        
        $rpb->save();

        return response()->json([
            'status' => 'success',
            'message' => 'RPB berhasil di-' . $validated['status'],
            'data' => $rpb
        ], 200);
    }
}
