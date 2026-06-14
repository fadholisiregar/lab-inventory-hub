<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class BatchBarang extends Model
{
    use UserTracking;

    protected $table = 'batch_barang';
    protected $fillable = [
        'barang_id', 'kode_batch', 'no_lot_supplier',
        'tgl_penerimaan', 'tgl_produksi', 'tgl_kadaluarsa',
        'jumlah_awal', 'stok_tersisa', 'kondisi', 'no_po',
        'supplier_id', 'harga_satuan', 'status_batch', 'lokasi_fisik', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'jumlah_awal'  => 'float',
        'stok_tersisa' => 'float',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'batch_barang_id');
    }
}
