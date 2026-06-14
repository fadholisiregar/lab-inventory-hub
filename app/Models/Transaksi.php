<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class Transaksi extends Model
{
    use UserTracking;

    protected $table = 'transaksi';
    
    protected $fillable = [
        'transaction_id',
        'jenis',
        'barang_id',
        'batch_barang_id',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'pengaju_id',
        'disetujui_oleh',
        'dieksekusi_oleh',
        'keperluan',
        'alasan_override',
        'tanda_terima',
        'created_by',
        'updated_by'
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function batchBarang()
    {
        return $this->belongsTo(BatchBarang::class, 'batch_barang_id');
    }

    public function pengaju()
    {
        return $this->belongsTo(User::class, 'pengaju_id');
    }

    public function disetujuiOleh()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }

    public function dieksekusiOleh()
    {
        return $this->belongsTo(User::class, 'dieksekusi_oleh');
    }

    public function penerimaanBarang()
    {
        return $this->hasOne(PenerimaanBarang::class, 'transaksi_id');
    }

    public function pengeluaranBarang()
    {
        return $this->hasOne(PengeluaranBarang::class, 'transaksi_id');
    }

    public function batchAlokasi()
    {
        return $this->hasMany(TransaksiBatchAlokasi::class, 'transaksi_id');
    }
}
