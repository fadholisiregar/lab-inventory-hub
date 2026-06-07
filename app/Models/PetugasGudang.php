<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetugasGudang extends Model
{
    protected $table = 'petugas_gudang';
    protected $fillable = ['user_id', 'laboran_id', 'kategori_rumpun_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function laboran()
    {
        return $this->belongsTo(Laboran::class);
    }

    public function kategoriRumpun()
    {
        return $this->belongsTo(KategoriRumpun::class, 'kategori_rumpun_id');
    }
}
