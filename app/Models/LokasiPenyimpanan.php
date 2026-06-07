<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class LokasiPenyimpanan extends Model
{
    use UserTracking;

    protected $table = 'lokasi_penyimpanan';
    protected $fillable = [
        'kode', 'nama', 'keterangan', 'created_by', 'updated_by'
    ];

    public function masterBarang()
    {
        return $this->hasMany(Barang::class, 'lokasi_id');
    }
}
