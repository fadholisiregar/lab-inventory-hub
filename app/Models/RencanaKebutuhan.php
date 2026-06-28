<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class RencanaKebutuhan extends Model
{
    use UserTracking;

    protected $table = 'rencana_kebutuhan';
    protected $fillable = [
        'program_studi_id', 'mata_kuliah_id', 'modul_praktikum_id', 'status',
        'created_by', 'updated_by',
    ];

    public function programStudi()
    {
        return $this->belongsTo(ProgramStudi::class, 'program_studi_id');
    }

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'mata_kuliah_id');
    }

    public function modulPraktikum()
    {
        return $this->belongsTo(ModulPraktikum::class, 'modul_praktikum_id');
    }

    public function items()
    {
        return $this->hasMany(RencanaKebutuhanItem::class, 'rencana_kebutuhan_id');
    }
}
