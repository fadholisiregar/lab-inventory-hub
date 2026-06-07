<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriRumpun extends Model
{
    protected $table = 'kategori_rumpun';
    protected $fillable = ['kode_rumpun', 'nama_rumpun', 'keterangan'];
}
