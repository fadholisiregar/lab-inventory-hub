<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get all users.
     */
    public function index(Request $request)
    {
        // Only Koordinator Gudang can access this
        if (!$request->user()->hasRole('Koordinator Gudang')) {
            return response()->json(['message' => 'Unauthorized. Only Koordinator Gudang can access.'], 403);
        }

        $users = User::with('roles')->orderBy('name')->get()->map(function ($user) {
            $userData = $user->toArray();
            $userData['roles'] = $user->roles->pluck('name')->toArray();
            return $userData;
        });
        return response()->json($users);
    }

    /**
     * Update roles for a specific user.
     */
    public function updateRoles(Request $request, User $user)
    {
        // Only Koordinator Gudang can access this
        if (!$request->user()->hasRole('Koordinator Gudang')) {
            return response()->json(['message' => 'Unauthorized. Only Koordinator Gudang can manage roles.'], 403);
        }

        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|in:Laboran,Petugas Gudang,Koordinator Gudang'
        ]);

        $roles = $request->roles;
        
        // Prevent removing own Koordinator Gudang role completely
        if ($user->id === $request->user()->id && !in_array('Koordinator Gudang', $roles)) {
            return response()->json(['message' => 'Cannot remove your own Koordinator Gudang role.'], 422);
        }

        $roleIds = \App\Models\Role::whereIn('name', $roles)->pluck('id');
        $user->roles()->sync($roleIds);

        $user->load('roles');
        $userData = $user->toArray();
        $userData['roles'] = $user->roles->pluck('name')->toArray();

        return response()->json([
            'message' => 'Roles updated successfully',
            'user' => $userData
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Password saat ini tidak cocok.']]
            ], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
}
