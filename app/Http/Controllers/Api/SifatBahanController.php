<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SifatBahan;
use Illuminate\Http\Request;

class SifatBahanController extends Controller
{
    public function index()
    {
        $sifat = SifatBahan::orderBy('nama')->get();
        return response()->json(['data' => $sifat]);
    }
}
