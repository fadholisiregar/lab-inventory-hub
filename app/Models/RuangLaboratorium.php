<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RuangLaboratorium extends Model
{
    use \App\Traits\UserTracking;

    protected $table = 'ruang_laboratorium';
    protected $fillable = [
        'kode', 'nama', 'keterangan', 'created_by', 'updated_by'
    ];
}
