<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\UserTracking;

class BatchBarang extends Model
{
    use UserTracking;

    protected $table = 'batch_barang';
    protected $fillable = [
        'barang_id', 'kode_batch', 'no_lot_penyedia',
        'tgl_penerimaan', 'tgl_produksi', 'tgl_kadaluarsa',
        'jumlah_awal', 'stok_tersisa', 'kondisi', 'no_po',
        'penyedia_id', 'harga_satuan', 'status_batch', 'status_kadaluarsa', 'lokasi_fisik', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'jumlah_awal'  => 'float',
        'stok_tersisa' => 'float',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'barang_id');
    }

    public function penyedia()
    {
        return $this->belongsTo(Penyedia::class, 'penyedia_id');
    }

    /**
     * Nomor batch otomatis, format B + urutan per barang (B001, B002, ...).
     * Hanya menghitung kode ber-pola ketat ^B\d+$ agar tidak menabrak format
     * lama (BCH-/BATCH-) yang akan menggagalkan CAST ke INTEGER.
     */
    public static function generateKodeBatch(int $barangId): string
    {
        $lastBatch = self::where('barang_id', $barangId)
            ->whereRaw("kode_batch ~ '^B[0-9]+$'")
            ->orderByRaw("CAST(SUBSTRING(kode_batch FROM 2) AS INTEGER) DESC")
            ->first();

        $nextNum = $lastBatch ? ((int) substr($lastBatch->kode_batch, 1) + 1) : 1;

        return 'B' . str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'batch_barang_id');
    }
}
