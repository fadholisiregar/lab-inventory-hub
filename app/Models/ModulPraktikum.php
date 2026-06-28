<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class ModulPraktikum extends Model
{
    use UserTracking;

    protected $table = 'modul_praktikum';
    protected $fillable = ['nama', 'mata_kuliah_id', 'created_by', 'updated_by'];

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }
}
