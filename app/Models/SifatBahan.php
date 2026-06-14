<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SifatBahan extends Model
{
    protected $table = 'sifat_bahan';
    protected $fillable = ['nama', 'warna'];

    public function barang()
    {
        return $this->belongsToMany(Barang::class, 'barang_sifat_bahan', 'sifat_bahan_id', 'barang_id');
    }
}
