<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Find a user and login
$user = App\Models\User::first();
auth()->login($user);

$request = Illuminate\Http\Request::create(
    '/api/pengeluaran',
    'POST',
    [],
    [],
    [],
    ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'],
    json_encode([
        'items' => [['barang_id' => 4, 'jumlah' => 100]],
        'ruang_laboratorium_id' => 41,
        'jenis_kegiatan' => 'Praktikum',
        'judul_kegiatan' => 'Fisika',
        'prodi_mitra' => 'Fisika'
    ])
);
$request->setLaravelSession(app('session')->driver());

$response = $kernel->handle($request);
echo $response->getContent();
