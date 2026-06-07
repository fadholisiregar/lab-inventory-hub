<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Koordinator extends Model
{
    protected $table = 'koordinator';
    protected $fillable = ['user_id', 'nomor_hp'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
