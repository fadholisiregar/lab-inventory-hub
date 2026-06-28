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
    Route::post('/penerimaan/import', [\App\Http\Controllers\Api\ImportBarangMasukController::class, 'import']);
    Route::get('/penerimaan/import/template', [\App\Http\Controllers\Api\ImportBarangMasukController::class, 'downloadTemplate']);

    // Transaksi Pengeluaran Barang
    Route::get('/pengeluaran', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'index']);
    Route::post('/pengeluaran', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'store']);
    Route::put('/pengeluaran/{id}/verify', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'verify']);
    Route::put('/pengeluaran/{id}/execute', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'execute']);
    Route::put('/pengeluaran/{id}/confirm', [\App\Http\Controllers\Api\PengeluaranBarangController::class, 'confirm']);
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
    Route::apiResource('jenis-kegiatan', \App\Http\Controllers\Api\JenisKegiatanController::class)
        ->parameters(['jenis-kegiatan' => 'jenisKegiatan']);
    Route::apiResource('penyedia', \App\Http\Controllers\Api\PenyediaController::class);
    Route::apiResource('barang', \App\Http\Controllers\Api\BarangController::class);

    // Master akademik (Perencanaan)
    Route::apiResource('program-studi', \App\Http\Controllers\Api\ProgramStudiController::class)
        ->parameters(['program-studi' => 'programStudi']);
    Route::apiResource('mata-kuliah', \App\Http\Controllers\Api\MataKuliahController::class)
        ->parameters(['mata-kuliah' => 'mataKuliah']);
    Route::apiResource('modul-praktikum', \App\Http\Controllers\Api\ModulPraktikumController::class)
        ->parameters(['modul-praktikum' => 'modulPraktikum']);

    // Modul Perencanaan (header-detail)
    Route::apiResource('rencana-kebutuhan', \App\Http\Controllers\Api\RencanaKebutuhanController::class)
        ->parameters(['rencana-kebutuhan' => 'rencanaKebutuhan']);
    // Pengadaan = item kebutuhan yang kurang stok
    Route::get('pengadaan-praktikum', [\App\Http\Controllers\Api\PengadaanPraktikumController::class, 'index']);
    Route::put('pengadaan-praktikum/{item}', [\App\Http\Controllers\Api\PengadaanPraktikumController::class, 'update']);
    Route::get('/batch-barang/search', [\App\Http\Controllers\Api\BatchBarangController::class, 'search']);
    Route::apiResource('ruang-laboratorium', \App\Http\Controllers\RuangLaboratoriumController::class);

    // Laporan APIs
    Route::prefix('laporan')->group(function () {
        Route::get('/rekap-transaksi', [\App\Http\Controllers\Api\LaporanController::class, 'rekapTransaksi']);
        Route::get('/rekap-transaksi/pdf', [\App\Http\Controllers\Api\LaporanController::class, 'rekapTransaksiPdf']);
        Route::get('/barang-populer', [\App\Http\Controllers\Api\LaporanController::class, 'barangPopuler']);
        Route::get('/barang-populer/pdf', [\App\Http\Controllers\Api\LaporanController::class, 'barangPopulerPdf']);
        Route::get('/efisiensi', [\App\Http\Controllers\Api\LaporanController::class, 'efisiensi']);
        Route::get('/efisiensi/pdf', [\App\Http\Controllers\Api\LaporanController::class, 'efisiensiPdf']);
        Route::get('/realisasi-perencanaan', [\App\Http\Controllers\Api\LaporanController::class, 'realisasiPerencanaan']);
        Route::get('/stok-audit', [\App\Http\Controllers\Api\LaporanController::class, 'stokAudit']);
        Route::get('/stok-audit/pdf', [\App\Http\Controllers\Api\LaporanController::class, 'stokAuditPdf']);
    });
});
