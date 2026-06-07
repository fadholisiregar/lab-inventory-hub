<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenerimaanBarang extends Model
{
    use HasFactory;
    
    protected $table = 'penerimaan_barang';
    
    protected $fillable = [
        'transaksi_id',
        'harga_sebelum_ppn',
        'harga_total',
        'harga_satuan',
        'laboran_id',
        'jenis_kegiatan',
        'link_pengadaan',
        'kode_status_transaksi',
        'diterima_oleh',
        'catatan',
        'created_by',
        'updated_by'
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id');
    }

    public function laboran()
    {
        return $this->belongsTo(Laboran::class, 'laboran_id');
    }

    public function statusTransaksi()
    {
        return $this->belongsTo(StatusTransaksi::class, 'kode_status_transaksi', 'kode');
    }

    public function diterima()
    {
        return $this->belongsTo(User::class, 'diterima_oleh');
    }
}
