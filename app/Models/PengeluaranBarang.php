<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;
class PengeluaranBarang extends Model
{
    use UserTracking;

    protected $table = 'pengeluaran_barang';
    protected $fillable = [
        'transaksi_id', 'kode_status_transaksi',
        'catatan', 'created_by', 'updated_by',
        'ruang_laboratorium_id', 'jenis_kegiatan', 'judul_kegiatan', 
        'prodi_mitra'
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id');
    }

    public function statusTransaksi()
    {
        return $this->belongsTo(StatusTransaksi::class, 'kode_status_transaksi', 'kode');
    }

    public function ruangLaboratorium()
    {
        return $this->belongsTo(RuangLaboratorium::class, 'ruang_laboratorium_id');
    }
}
