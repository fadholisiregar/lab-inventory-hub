<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class DetailRpb extends Model
{
    use UserTracking;

    protected $table = 'detail_rpb';
    protected $fillable = [
        'rpb_id', 'barang_id', 'jumlah_diminta', 'created_by', 'updated_by'
    ];

    public function rencanaPengambilanBahan()
    {
        return $this->belongsTo(RencanaPengambilanBahan::class, 'rpb_id');
    }

    public function masterBarang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }
}
