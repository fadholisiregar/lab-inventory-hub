<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RencanaKebutuhanItem extends Model
{
    protected $table = 'rencana_kebutuhan_item';
    protected $fillable = [
        'rencana_kebutuhan_id', 'barang_id', 'jumlah_pengajuan', 'stok_saat_pengajuan',
        'status_item', 'harga_penawaran', 'penyedia_id', 'status_pengadaan',
    ];

    protected $casts = [
        'jumlah_pengajuan'    => 'float',
        'stok_saat_pengajuan' => 'float',
        'harga_penawaran'     => 'float',
    ];

    public function rencana()
    {
        return $this->belongsTo(RencanaKebutuhan::class, 'rencana_kebutuhan_id');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function penyedia()
    {
        return $this->belongsTo(Penyedia::class, 'penyedia_id');
    }
}
