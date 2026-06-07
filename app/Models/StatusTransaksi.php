<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class StatusTransaksi extends Model
{
    use UserTracking;

    protected $table = 'status_transaksi';
    protected $fillable = [
        'kategori', 'kode', 'nama', 'keterangan', 'created_by', 'updated_by'
    ];
}
