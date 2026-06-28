<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PeriodeAkademik;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PeriodeAkademikController extends Controller
{
    public function index(Request $request)
    {
        $query = PeriodeAkademik::orderByDesc('tahun_ajaran')->orderBy('semester');
        if ($request->boolean('aktif')) {
            $query->where('is_aktif', true);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $this->validateData($request);
        $periode = DB::transaction(function () use ($validated) {
            $p = PeriodeAkademik::create($validated);
            if ($p->is_aktif) {
                PeriodeAkademik::where('id', '!=', $p->id)->update(['is_aktif' => false]);
            }
            return $p;
        });
        return response()->json(['message' => 'Periode akademik ditambahkan', 'data' => $periode], 201);
    }

    public function show(PeriodeAkademik $periodeAkademik)
    {
        return response()->json($periodeAkademik);
    }

    public function update(Request $request, PeriodeAkademik $periodeAkademik)
    {
        $validated = $this->validateData($request, $periodeAkademik->id);
        DB::transaction(function () use ($periodeAkademik, $validated) {
            $periodeAkademik->update($validated);
            if ($periodeAkademik->is_aktif) {
                PeriodeAkademik::where('id', '!=', $periodeAkademik->id)->update(['is_aktif' => false]);
            }
        });
        return response()->json(['message' => 'Periode akademik diperbarui', 'data' => $periodeAkademik]);
    }

    public function destroy(PeriodeAkademik $periodeAkademik)
    {
        if ($periodeAkademik->rencanaKebutuhan()->exists()) {
            return response()->json(['message' => 'Tidak dapat dihapus karena sudah dipakai pada rencana kebutuhan.'], 400);
        }
        $periodeAkademik->delete();
        return response()->json(['message' => 'Periode akademik dihapus']);
    }

    private function validateData(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'tahun_ajaran'    => 'required|string',
            'semester'        => 'required|in:Ganjil,Genap',
            'tanggal_mulai'   => 'nullable|date',
            'tanggal_selesai' => 'nullable|date|after_or_equal:tanggal_mulai',
            'is_aktif'        => 'nullable|boolean',
        ]);
    }
}
