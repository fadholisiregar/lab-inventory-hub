<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class MataKuliah extends Model
{
    use UserTracking;

    protected $table = 'mata_kuliah';
    protected $fillable = ['kode', 'nama', 'program_studi_id', 'created_by', 'updated_by'];

    public function programStudi()
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    public function modulPraktikum()
    {
        return $this->hasMany(ModulPraktikum::class, 'mata_kuliah_id');
    }
}
