<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $query = Role::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('kode', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
        }

        if ($request->has('all')) {
            return response()->json(['data' => $query->orderBy('name')->get()]);
        }

        $perPage = $request->get('per_page', 10);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:roles,kode',
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        $role = Role::create($validated);
        return response()->json(['message' => 'Role berhasil ditambahkan', 'data' => $role], 201);
    }

    public function show(Role $role)
    {
        return response()->json($role);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:50|unique:roles,kode,' . $role->id,
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
        ]);

        $role->update($validated);
        return response()->json(['message' => 'Role berhasil diperbarui', 'data' => $role]);
    }

    public function destroy(Role $role)
    {
        // Protect roles assigned to users
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Role tidak dapat dihapus karena masih dimiliki oleh pengguna.'], 400);
        }

        $role->delete();
        return response()->json(['message' => 'Role berhasil dihapus']);
    }
}
