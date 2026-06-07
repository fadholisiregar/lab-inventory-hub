<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class DetailRkb extends Model
{
    use UserTracking;

    protected $fillable = [
        'rencana_kebutuhan_barang_id',
        'barang_id',
        'alasan_kebutuhan',
        'jumlah_rekomendasi', 'created_by', 'updated_by'
    ];

    public function rkb()
    {
        return $this->belongsTo(RencanaKebutuhanBarang::class, 'rencana_kebutuhan_barang_id');
    }

    public function masterBarang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
