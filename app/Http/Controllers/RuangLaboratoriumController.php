<?php

namespace App\Http\Controllers;

use App\Models\RuangLaboratorium;
use Illuminate\Http\Request;

class RuangLaboratoriumController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\RuangLaboratorium::query();
        if ($request->has('search') && $request->search != '') {
            $query->where('nama', 'like', "%{$request->search}%")
                  ->orWhere('kode', 'like', "%{$request->search}%");
        }
        
        // Disable pagination if per_page is -1 or explicitly 'all'
        if ($request->has('per_page') && $request->per_page == -1) {
            return response()->json($query->orderBy('nama')->get());
        }
        
        $perPage = $request->get('per_page', 10);
        return response()->json($query->orderBy('nama')->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string'
        ]);

        $ruang = \App\Models\RuangLaboratorium::create($request->all());
        return response()->json(['message' => 'Ruang Laboratorium berhasil ditambahkan', 'data' => $ruang], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RuangLaboratorium $ruangLaboratorium)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $ruang = \App\Models\RuangLaboratorium::findOrFail($id);
        
        $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:50',
            'keterangan' => 'nullable|string'
        ]);

        $ruang->update($request->all());
        return response()->json(['message' => 'Ruang Laboratorium berhasil diupdate', 'data' => $ruang]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ruang = \App\Models\RuangLaboratorium::findOrFail($id);
        $ruang->delete();
        return response()->json(['message' => 'Ruang Laboratorium berhasil dihapus']);
    }
}
