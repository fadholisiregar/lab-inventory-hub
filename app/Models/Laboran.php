<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Laboran extends Model
{
    protected $table = 'laboran';
    protected $fillable = ['user_id', 'nomor_hp', 'pic_labs'];

    protected $casts = [
        'pic_labs' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function koordinator()
    {
        return $this->hasOne(Koordinator::class);
    }
}
