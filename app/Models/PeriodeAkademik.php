<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class PeriodeAkademik extends Model
{
    use UserTracking;

    protected $table = 'periode_akademik';
    protected $fillable = [
        'tahun_ajaran', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'is_aktif',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    protected $appends = ['nama'];

    public function getNamaAttribute(): string
    {
        return "{$this->semester} {$this->tahun_ajaran}";
    }

    public function rencanaKebutuhan()
    {
        return $this->hasMany(RencanaKebutuhan::class, 'periode_akademik_id');
    }
}
