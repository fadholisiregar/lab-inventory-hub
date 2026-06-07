<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Delete detail_transaksi completely (to avoid foreign key issues)
        Schema::dropIfExists('detail_transaksi');
        // 2. Delete old transaksi completely
        Schema::dropIfExists('transaksi');

        // 3. Create new transaksi table
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->index();
            $table->enum('jenis', ['Masuk', 'Keluar']);
            $table->foreignId('barang_id')->constrained('barang');
            $table->foreignId('batch_barang_id')->nullable()->constrained('batch_barang');
            $table->decimal('jumlah', 10, 2);
            $table->decimal('stok_sebelum', 10, 2)->default(0);
            $table->decimal('stok_sesudah', 10, 2)->default(0);
            $table->foreignId('pengaju_id')->nullable()->constrained('users');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->foreignId('dieksekusi_oleh')->nullable()->constrained('users');
            $table->text('keperluan')->nullable();
            $table->boolean('tanda_terima')->default(false);
            $table->timestamps();
        });

        // 4. Update penerimaan_barang
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropForeign(['barang_id']);
            $table->dropForeign(['petugas_gudang_id']);
            $table->dropColumn(['barang_id', 'jumlah', 'petugas_gudang_id']);

            $table->foreignId('transaksi_id')->nullable()->after('id')->constrained('transaksi');
            $table->decimal('harga_sebelum_ppn', 15, 2)->nullable()->after('transaksi_id');
            $table->decimal('harga_total', 15, 2)->nullable()->after('harga_sebelum_ppn');
            $table->decimal('harga_satuan', 15, 2)->nullable()->after('harga_total');
            $table->string('pic_barang_masuk')->nullable()->after('harga_satuan');
            $table->string('jenis_kegiatan')->nullable()->after('pic_barang_masuk');
            $table->string('link_pengadaan')->nullable()->after('jenis_kegiatan');
        });

        // 5. Update pengeluaran_barang
        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['disetujui_oleh']);
            $table->dropForeign(['dieksekusi_oleh']);
            $table->dropForeign(['petugas_gudang_id']);
            $table->dropColumn(['disetujui_oleh', 'dieksekusi_oleh', 'petugas_gudang_id', 'keperluan']);

            $table->foreignId('transaksi_id')->nullable()->after('id')->constrained('transaksi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing this completely is complex and destructive.
        // For now, we will drop the new table and reverse columns.
        Schema::table('penerimaan_barang', function (Blueprint $table) {
            $table->dropForeign(['transaksi_id']);
            $table->dropColumn(['transaksi_id', 'harga_sebelum_ppn', 'harga_total', 'harga_satuan', 'pic_barang_masuk', 'jenis_kegiatan', 'link_pengadaan']);
            
            $table->foreignId('barang_id')->nullable()->constrained('barang');
            $table->integer('jumlah')->default(0);
            $table->foreignId('petugas_gudang_id')->nullable()->constrained('petugas_gudang');
        });

        Schema::table('pengeluaran_barang', function (Blueprint $table) {
            $table->dropForeign(['transaksi_id']);
            $table->dropColumn(['transaksi_id']);

            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->foreignId('dieksekusi_oleh')->nullable()->constrained('users');
            $table->foreignId('petugas_gudang_id')->nullable()->constrained('petugas_gudang');
            $table->text('keperluan')->nullable();
        });

        Schema::dropIfExists('transaksi');

        // We do not recreate old transaksi and detail_transaksi in down() for simplicity.
    }
};
