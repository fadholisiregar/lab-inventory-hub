<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class KategoriBarang extends Model
{
    use UserTracking;

    protected $table = 'kategori_barang';
    protected $fillable = ['kode', 'nama', 'keterangan', 'created_by', 'updated_by'];

    public function masterBarang()
    {
        return $this->hasMany(Barang::class, 'kategori_id');
    }
}
