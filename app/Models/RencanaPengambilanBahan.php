<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class RencanaPengambilanBahan extends Model
{
    use UserTracking;

    protected $table = 'rencana_pengambilan_bahan';
    protected $fillable = [
        'laboran_id', 'jadwal_praktikum', 'status', 'alasan_penolakan', 'koordinator_id', 'created_by', 'updated_by'
    ];

    public function laboran()
    {
        return $this->belongsTo(User::class, 'laboran_id');
    }

    public function koordinator()
    {
        return $this->belongsTo(User::class, 'koordinator_id');
    }

    public function detailRpb()
    {
        return $this->hasMany(DetailRpb::class, 'rpb_id');
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'referensi_rpb_id');
    }
}
