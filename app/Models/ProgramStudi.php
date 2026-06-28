<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class ProgramStudi extends Model
{
    use UserTracking;

    protected $table = 'program_studi';
    protected $fillable = ['kode', 'nama', 'created_by', 'updated_by'];

    public function mataKuliah()
    {
        return $this->hasMany(MataKuliah::class, 'program_studi_id');
    }
}
