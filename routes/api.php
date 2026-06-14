<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user()->load('roles');
        $userData = $user->toArray();
        $userData['roles'] = $user->roles->pluck('name')->toArray();
        return $userData;
    });
    
    Route::post('/user/change-password', [\App\Http\Controllers\Api\UserController::class, 'changePassword']);

    // Data APIs for Frontend
    Route::get('/materials', [\App\Http\Controllers\Api\DataController::class, 'getMaterials']);
    Route::get('/requests', [\App\Http\Controllers\Api\DataController::class, 'getRequests']);
    Route::get('/reports/monthly', [\App\Http\Controllers\Api\DataController::class, 'getMonthlyReport']);

    // User Management APIs
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::put('/users/{user}/roles', [\App\Http\Controllers\Api\UserController::class, 'updateRoles']);
    
    // Transaksi Penerimaan Barang
    Route::get('/penerimaan', [\App\Http\Controllers\Api\PenerimaanBarangController::class, 'index']);
    Route::post('/penerimaan', [\App\Http\Controllers\Api\PenerimaanBarangController::class, 'store']);
    Route::put('/penerimaan/{id}/verify', [\App\Http\Controllers\Api\PenerimaanBarangController::class, 'verify']);

    // Transaksi Pengeluaran Barang
    Route::get('/pengeluaran', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'index']);
    Route::post('/pengeluaran', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'store']);
    Route::put('/pengeluaran/{id}/verify', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'verify']);
    Route::put('/pengeluaran/{id}/execute', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'execute']);
    Route::put('/pengeluaran/{id}/confirm', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'confirm']);
    Route::get('/pengeluaran/{id}/download-pdf', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'downloadPdf']);
    Route::get('/pengeluaran/{id}/surat-jalan', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'downloadSuratJalan']);

    

    Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
    Route::apiResource('lokasi-penyimpanan', \App\Http\Controllers\Api\LokasiPenyimpananController::class);
    Route::apiResource('laboran', \App\Http\Controllers\Api\LaboranController::class);
    Route::apiResource('koordinator', \App\Http\Controllers\Api\KoordinatorController::class);
    Route::apiResource('petugas-gudang', \App\Http\Controllers\Api\PetugasGudangController::class);

    // Master Data APIs
    Route::apiResource('kategori_barang', \App\Http\Controllers\Api\KategoriBarangController::class);
    Route::apiResource('satuan', \App\Http\Controllers\Api\SatuanController::class);
    Route::apiResource('kategori-rumpun', \App\Http\Controllers\Api\KategoriRumpunController::class);
    Route::apiResource('status-transaksi', \App\Http\Controllers\Api\StatusTransaksiController::class);
    Route::get('sifat-bahan', [\App\Http\Controllers\Api\SifatBahanController::class, 'index']);
    Route::apiResource('barang', \App\Http\Controllers\Api\BarangController::class);
    Route::get('/batch-barang/search', [\App\Http\Controllers\Api\BatchBarangController::class, 'search']);
    Route::apiResource('ruang-laboratorium', \App\Http\Controllers\RuangLaboratoriumController::class);

    // Laporan APIs
    Route::prefix('laporan')->group(function () {
        Route::get('/rekap-transaksi', [\App\Http\Controllers\Api\LaporanController::class, 'rekapTransaksi']);
        Route::get('/barang-populer', [\App\Http\Controllers\Api\LaporanController::class, 'barangPopuler']);
        Route::get('/efisiensi', [\App\Http\Controllers\Api\LaporanController::class, 'efisiensi']);
        Route::get('/stok-audit', [\App\Http\Controllers\Api\LaporanController::class, 'stokAudit']);
    });
});
