<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$barang = \App\Models\Barang::all();
echo "Table: barang\n";
echo "Count: " . $barang->count() . "\n";

$master = \Illuminate\Support\Facades\DB::table('master_barang')->count();
echo "Table: master_barang\n";
echo "Count: " . $master . "\n";
