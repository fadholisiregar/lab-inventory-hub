<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class Supplier extends Model
{
    use UserTracking;

    protected $table = 'supplier';
    protected $fillable = ['nama_supplier', 'kontak', 'alamat', 'created_by', 'updated_by'];

    public function batchBarang()
    {
        return $this->hasMany(BatchBarang::class, 'supplier_id');
    }
}
