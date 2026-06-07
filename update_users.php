<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user2 = App\Models\User::find(2);
if ($user2) {
    $user2->name = 'Koordinator Gudang';
    $user2->email = 'koordinator@itk.ac.id';
    $user2->save();
    echo "User 2 updated to Koordinator Gudang.\n";
}

$user4 = App\Models\User::find(4);
if ($user4) {
    $user4->name = str_replace('Koordinator', 'Petugas Gudang', $user4->name);
    $user4->email = str_replace('koor', 'petugas', $user4->email);
    $user4->save();
    echo "User 4 updated to " . $user4->name . ".\n";
}
