<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class Penyedia extends Model
{
    use UserTracking;

    protected $table = 'penyedia';
    protected $fillable = ['kode_penyedia', 'nama_penyedia', 'kontak', 'alamat', 'created_by', 'updated_by'];

    public function batchBarang()
    {
        return $this->hasMany(BatchBarang::class, 'penyedia_id');
    }
}
