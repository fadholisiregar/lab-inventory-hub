<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class RencanaKebutuhanBarang extends Model
{
    use UserTracking;

    protected $table = 'rencana_kebutuhan_barang';
    protected $fillable = ['status', 'tgl_generate', 'created_by', 'updated_by'];

    public function details()
    {
        return $this->hasMany(DetailRkb::class);
    }
}
