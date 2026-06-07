<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class Satuan extends Model
{
    use UserTracking;

    protected $table = 'satuan';

    protected $fillable = [
        'simbol', 'nama_satuan', 'keterangan', 'created_by', 'updated_by'
    ];
}
