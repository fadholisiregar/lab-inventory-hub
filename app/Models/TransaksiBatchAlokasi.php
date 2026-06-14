<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiBatchAlokasi extends Model
{
    protected $table = 'transaksi_batch_alokasi';

    protected $fillable = ['transaksi_id', 'batch_barang_id', 'jumlah_diambil'];

    public function batchBarang()
    {
        return $this->belongsTo(BatchBarang::class, 'batch_barang_id');
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class);
    }
}
