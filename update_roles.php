<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user2 = App\Models\User::find(2);
if ($user2) {
    $user2->roles()->sync([2]); // Koordinator Gudang
    echo "User 2 synced to Koordinator Gudang\n";
}

$user4 = App\Models\User::find(4);
if ($user4) {
    $user4->roles()->sync([3, 1]); // Petugas Gudang and Laboran
    echo "User 4 synced to Petugas Gudang & Laboran\n";
}
