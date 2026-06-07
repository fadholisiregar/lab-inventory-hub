<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class Barang extends Model
{
    use UserTracking;

    protected $table = 'barang';
    protected $fillable = [
        'kode_barang', 'nama_barang', 'spesifikasi', 'kategori_id',
        'satuan_id', 'stok_minimum', 'total_stok', 'lokasi_id', 'sifat_bahan', 'perlu_kadaluarsa', 'created_by', 'updated_by'
    ];

    public function kategori()
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    public function satuan()
    {
        return $this->belongsTo(Satuan::class, 'satuan_id');
    }

    public function lokasi()
    {
        return $this->belongsTo(LokasiPenyimpanan::class, 'lokasi_id');
    }

    public function batchBarang()
    {
        return $this->hasMany(BatchBarang::class, 'barang_id');
    }

    public function detailRpb()
    {
        return $this->hasMany(DetailRpb::class, 'barang_id');
    }
}
