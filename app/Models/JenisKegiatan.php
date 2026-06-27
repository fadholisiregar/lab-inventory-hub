<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisKegiatan extends Model
{
    protected $table = 'jenis_kegiatan';
    protected $fillable = ['nama', 'wajib_link_pengadaan', 'aktif'];

    protected $casts = [
        'wajib_link_pengadaan' => 'boolean',
        'aktif'                => 'boolean',
    ];

    public function penerimaan()
    {
        return $this->hasMany(PenerimaanBarang::class, 'jenis_kegiatan_id');
    }
}
