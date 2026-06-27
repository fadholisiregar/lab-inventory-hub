<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SifatBahan extends Model
{
    protected $table = 'sifat_bahan';
    protected $fillable = ['nama', 'kode_ghs', 'warna'];

    /**
     * Label bahaya GHS, mis. "Mudah Terbakar (Flammable) (GHS02)".
     */
    public function getLabelGhsAttribute(): string
    {
        return $this->kode_ghs ? "{$this->nama} ({$this->kode_ghs})" : $this->nama;
    }

    public function barang()
    {
        return $this->belongsToMany(Barang::class, 'barang_sifat_bahan', 'sifat_bahan_id', 'barang_id');
    }
}
