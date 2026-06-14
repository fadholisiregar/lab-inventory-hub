<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengeluaranBarang;
use App\Models\DetailTransaksi;
use App\Models\BatchBarang;
use App\Models\Barang;
use App\Models\User;
use App\Mail\EmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PengeluaranBarangController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $isKoordinator = $user->hasRole('Koordinator Gudang') || $user->hasRole('Koordinator');
        $isPetugas = $user->hasRole('Petugas Gudang');
        $isLaboran = $user->hasRole('Laboran');
        
        $statusKode = $request->query('status_kode');
        $statusKodeNot = $request->query('status_kode_not');

        $query = PengeluaranBarang::with(['statusTransaksi', 'creator', 'transaksi.pengaju', 'transaksi.disetujuiOleh', 'transaksi.dieksekusiOleh', 'transaksi.barang.satuan', 'transaksi.barang.kategori', 'transaksi.batchBarang', 'transaksi.barang.batchBarang', 'transaksi.batchAlokasi.batchBarang', 'ruangLaboratorium'])
            ->orderBy('created_at', 'desc');

        // Filter by user's role access (combining if user has multiple roles)
        if (!$isKoordinator && !$isPetugas) {
            $query->where(function($q) use ($user, $isLaboran) {
                if ($isLaboran) {
                    $q->orWhere('created_by', $user->id);
                }
            });
        }

        if ($statusKode) {
            $query->whereHas('statusTransaksi', function($q) use ($statusKode) {
                if (is_array($statusKode)) {
                    $q->whereIn('kode', $statusKode);
                } else {
                    $q->where('kode', $statusKode);
                }
            });
        }

        if ($statusKodeNot) {
            $query->whereHas('statusTransaksi', function($q) use ($statusKodeNot) {
                if (is_array($statusKodeNot)) {
                    $q->whereNotIn('kode', $statusKodeNot);
                } else {
                    $q->where('kode', '!=', $statusKodeNot);
                }
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        if (!$request->user()->hasRole('Laboran')) {
            return response()->json(['message' => 'Unauthorized. Hanya Laboran yang dapat mengajukan permintaan barang.'], 403);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah' => 'required|numeric|min:0.01',
            'keperluan' => 'nullable|string',
            'ruang_laboratorium_id' => 'required|exists:ruang_laboratorium,id',
            'jenis_kegiatan' => 'required|string',
            'judul_kegiatan' => 'required|string',
            'prodi_mitra' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BK-PENDING')->first();

            $transactionIdStr = 'TRX-BK-' . date('YmdHis') . '-' . rand(100, 999);

            $pengeluaranItems = [];
            foreach ($request->items as $item) {
                $barang = Barang::findOrFail($item['barang_id']);
                $totalStok = $barang->total_stok ?? 0;

                // Create Transaksi
                $transaksi = \App\Models\Transaksi::create([
                    'transaction_id' => $transactionIdStr,
                    'jenis' => 'Keluar',
                    'barang_id' => $barang->id,
                    'jumlah' => $item['jumlah'],
                    'stok_sebelum' => $totalStok,
                    'stok_sesudah' => $totalStok - $item['jumlah'],
                    'pengaju_id' => $request->user()->id,
                    'keperluan' => $request->keperluan
                ]);

                // Create PengeluaranBarang Header
                $pengeluaran = PengeluaranBarang::create([
                    'transaksi_id' => $transaksi->id,
                    'created_by' => $request->user()->id,
                    'ruang_laboratorium_id' => $request->ruang_laboratorium_id,
                    'jenis_kegiatan' => $request->jenis_kegiatan,
                    'judul_kegiatan' => $request->judul_kegiatan,
                    'prodi_mitra' => $request->prodi_mitra,
                    'kode_status_transaksi' => $statusPending->kode,
                ]);

                $pengeluaranItems[] = $pengeluaran;
            }

            DB::commit();

            try {
                // Notifikasi ke Koordinator Gudang
                $koordinators = User::whereHas('roles', function($q) {
                    $q->where('name', 'Koordinator Gudang');
                })->get();
                
                $title = "Permintaan Bahan Baru dari " . $request->user()->name;
                $body = "Ada permohonan bahan/barang baru untuk kegiatan: {$transaksi->judul_kegiatan}.\nHarap segera diperiksa dan diverifikasi melalui sistem Lab Inventory Hub.";
                
                foreach ($koordinators as $koor) {
                    if ($koor->email) {
                        Mail::to($koor->email)->send(new EmailNotification($title, $body));
                    }
                }
            } catch (\Exception $e) {
                // Biarkan lanjut jika email gagal agar tidak membatalkan transaksi
                \Log::error('Gagal kirim email notifikasi: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Pengeluaran barang berhasil diajukan dan menunggu verifikasi Koordinator.', 'transaksi' => $transaksi]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function verify(Request $request, $id)
    {
        $rules = [
            'status' => 'required|in:Disetujui,Ditolak',
            'catatan' => 'nullable|string'
        ];

        if ($request->status === 'Disetujui') {
            $rules['petugas_gudang_id'] = 'required|exists:petugas_gudang,id';
        }

        $request->validate($rules);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            $statusPending = \App\Models\StatusTransaksi::where('kode', 'BK-PENDING')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusPending->kode) {
                return response()->json(['message' => 'Transaksi sudah diproses.'], 400);
            }

            $kodeStatus = $request->status === 'Disetujui' ? 'BK-DISETUJUI' : 'BK-DITOLAK';
            $statusUpdate = \App\Models\StatusTransaksi::where('kode', $kodeStatus)->first();

            $pengeluaran->kode_status_transaksi = $statusUpdate->kode;
            $pengeluaran->updated_by = $request->user()->id;
            if (empty($pengeluaran->created_by)) {
                $pengeluaran->created_by = $request->user()->id;
            }

            $transaksi = $pengeluaran->transaksi;

            if ($request->status === 'Disetujui') {
                $petugas = \App\Models\PetugasGudang::findOrFail($request->petugas_gudang_id);
                $barangMaster = Barang::find($transaksi->barang_id);

                if (!$barangMaster || $barangMaster->total_stok < $transaksi->jumlah) {
                    throw new \Exception("Stok total tidak mencukupi untuk barang: " . ($barangMaster ? $barangMaster->nama_barang : 'Unknown'));
                }

                // Hitung alokasi otomatis FEFO/FIFO lintas batch
                $useFefo = !is_null($barangMaster->tanggal_kadaluarsa);
                $batches = \App\Models\BatchBarang::where('barang_id', $transaksi->barang_id)
                    ->where('stok_tersisa', '>', 0)
                    ->where('status_batch', 'Aktif')
                    ->when($useFefo,
                        fn($q) => $q->orderByRaw('tgl_kadaluarsa ASC NULLS LAST'),
                        fn($q) => $q->orderBy('tgl_penerimaan', 'asc')
                    )
                    ->get();

                $jumlah = (float) $transaksi->jumlah;
                $remaining = $jumlah;
                $allocations = [];
                foreach ($batches as $batch) {
                    if ($remaining <= 0) break;
                    $take = min((float) $batch->stok_tersisa, $remaining);
                    $allocations[] = ['batch' => $batch, 'jumlah' => $take];
                    $remaining = round($remaining - $take, 10);
                }

                if ($remaining > 0.0001) {
                    throw new \Exception("Stok batch aktif tidak mencukupi. Kekurangan {$remaining} unit.");
                }

                $newTotalStok = $barangMaster->total_stok - $jumlah;
                $transaksi->stok_sebelum = $barangMaster->total_stok;
                $transaksi->stok_sesudah = $newTotalStok;
                $transaksi->dieksekusi_oleh = $petugas->user_id;
                $transaksi->disetujui_oleh = $request->user()->id;
                $transaksi->save();

                $barangMaster->total_stok = $newTotalStok;
                $barangMaster->save();

                foreach ($allocations as $alloc) {
                    $alloc['batch']->stok_tersisa = (float) $alloc['batch']->stok_tersisa - (float) $alloc['jumlah'];
                    $alloc['batch']->save();

                    \App\Models\TransaksiBatchAlokasi::create([
                        'transaksi_id'    => $transaksi->id,
                        'batch_barang_id' => $alloc['batch']->id,
                        'jumlah_diambil'  => $alloc['jumlah'],
                    ]);
                }
            }

            $pengeluaran->save();

            DB::commit();

            try {
                // Notifikasi hasil verifikasi ke pengaju (Laboran)
                $pengaju = User::find($transaksi->created_by);
                if ($pengaju && $pengaju->email) {
                    $title = "Hasil Verifikasi Permintaan Bahan";
                    $body = "Permintaan bahan Anda untuk kegiatan: {$transaksi->judul_kegiatan}\nStatus: {$request->status}\nCatatan: " . ($request->catatan ?? '-');
                    
                    if ($request->status === 'Disetujui') {
                        $body .= "\n\nBarang Anda sedang disiapkan oleh Petugas Gudang.";
                    }
                    
                    Mail::to($pengaju->email)->send(new EmailNotification($title, $body));
                }
            } catch (\Exception $e) {
                \Log::error('Gagal kirim email verifikasi: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Verifikasi berhasil disimpan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function execute(Request $request, $id)
    {
        if (!$request->user()->hasRole('Petugas Gudang')) {
            return response()->json(['message' => 'Unauthorized. Hanya Petugas Gudang yang dapat mengeksekusi.'], 403);
        }

        $request->validate([
            'fisik_sesuai' => 'required|boolean',
            'catatan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            $transaksi = $pengeluaran->transaksi;
            
            $statusDisetujui = \App\Models\StatusTransaksi::where('kode', 'BK-DISETUJUI')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusDisetujui->kode) {
                return response()->json(['message' => 'Transaksi belum disetujui atau sudah dieksekusi.'], 400);
            }

            if ($request->fisik_sesuai) {
                $statusMenunggu = \App\Models\StatusTransaksi::where('kode', 'BK-MENUNGGU')->first();
                $pengeluaran->kode_status_transaksi = $statusMenunggu->kode;
                $pengeluaran->save();
                DB::commit();
                return response()->json(['message' => 'Barang berhasil disiapkan. Menunggu konfirmasi Laboran.']);
            } else {
                // Titik 1: Fisik tidak sesuai (Stock Opname Required)
                $statusDitolak = \App\Models\StatusTransaksi::where('kode', 'BK-DITOLAK')->first();
                $pengeluaran->kode_status_transaksi = $statusDitolak->kode;
                $pengeluaran->save();

                // Revert stock — gunakan alokasi multi-batch jika ada
                $master = Barang::find($transaksi->barang_id);
                if ($master) {
                    $master->total_stok = (float) $master->total_stok + (float) $transaksi->jumlah;
                    $master->save();
                }

                $this->revertBatchAlokasi($transaksi);

                DB::commit();

                try {
                    $koordinators = User::whereHas('roles', function($q) {
                        $q->where('name', 'Koordinator Gudang');
                    })->get();

                    $title = "Peringatan: Fisik Tidak Sesuai (Butuh Stock Opname)";
                    $body = "Petugas Gudang melaporkan bahwa fisik barang tidak sesuai dengan sistem pada transaksi {$transaksi->transaction_id}.\nCatatan Petugas: " . ($request->catatan ?? 'Tidak ada') . "\nTransaksi ini telah dibatalkan otomatis dan stok dikembalikan. Harap segera lakukan penyesuaian (Stock Opname).";

                    foreach ($koordinators as $koor) {
                        if ($koor->email) {
                            Mail::to($koor->email)->send(new EmailNotification($title, $body));
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Gagal kirim email: ' . $e->getMessage());
                }

                return response()->json(['message' => 'Transaksi dibatalkan karena fisik tidak sesuai. Koordinator telah dinotifikasi.']);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function confirm(Request $request, $id)
    {
        if (!$request->user()->hasRole('Laboran')) {
            return response()->json(['message' => 'Unauthorized. Hanya Laboran yang dapat melakukan konfirmasi.'], 403);
        }

        $request->validate([
            'sesuai' => 'required|boolean',
            'catatan' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            
            $statusMenunggu = \App\Models\StatusTransaksi::where('kode', 'BK-MENUNGGU')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusMenunggu->kode) {
                return response()->json(['message' => 'Status transaksi tidak valid untuk konfirmasi.'], 400);
            }
            
            if ($pengeluaran->created_by !== $request->user()->id) {
                return response()->json(['message' => 'Hanya pengaju asli yang dapat mengonfirmasi transaksi ini.'], 403);
            }

            $transaksi = $pengeluaran->transaksi;

            if ($request->sesuai) {
                $statusSelesai = \App\Models\StatusTransaksi::where('kode', 'BK-SELESAI')->first();
                $pengeluaran->kode_status_transaksi = $statusSelesai->kode;
                
                if ($transaksi) {
                    $transaksi->tanda_terima = true;
                    $transaksi->save();
                }
                
                $pengeluaran->save();

                DB::commit();
                return response()->json(['message' => 'Penerimaan barang berhasil dikonfirmasi. Transaksi selesai.']);
            } else {
                // Titik 2: Barang yang diterima Laboran tidak sesuai dengan Surat Jalan
                $statusDitolak = \App\Models\StatusTransaksi::where('kode', 'BK-DITOLAK')->first();
                $pengeluaran->kode_status_transaksi = $statusDitolak->kode;
                $pengeluaran->save();

                // Revert stock — gunakan alokasi multi-batch jika ada
                $master = Barang::find($transaksi->barang_id);
                if ($master) {
                    $master->total_stok = (float) $master->total_stok + (float) $transaksi->jumlah;
                    $master->save();
                }

                $this->revertBatchAlokasi($transaksi);

                DB::commit();

                try {
                    $koordinators = User::whereHas('roles', function($q) {
                        $q->where('name', 'Koordinator Gudang');
                    })->get();

                    $title = "Laporan Ketidaksesuaian Penerimaan Barang";
                    $body = "Laboran (" . $request->user()->name . ") melaporkan bahwa barang yang diterima tidak sesuai dengan Surat Jalan pada transaksi {$transaksi->transaction_id}.\nCatatan Laboran: " . ($request->catatan ?? 'Tidak ada') . "\nTransaksi ini telah dibatalkan. Harap selidiki lebih lanjut.";
                    
                    foreach ($koordinators as $koor) {
                        if ($koor->email) {
                            Mail::to($koor->email)->send(new EmailNotification($title, $body));
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Gagal kirim email: ' . $e->getMessage());
                }

                return response()->json(['message' => 'Laporan ketidaksesuaian berhasil dikirim. Transaksi dibatalkan.']);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Kembalikan stok batch dari alokasi multi-batch, dengan fallback ke single batch lama.
     */
    private function revertBatchAlokasi(\App\Models\Transaksi $transaksi): void
    {
        $alokasis = \App\Models\TransaksiBatchAlokasi::where('transaksi_id', $transaksi->id)->get();

        if ($alokasis->count() > 0) {
            foreach ($alokasis as $alokasi) {
                $batch = \App\Models\BatchBarang::find($alokasi->batch_barang_id);
                if ($batch) {
                    $batch->stok_tersisa = (float) $batch->stok_tersisa + (float) $alokasi->jumlah_diambil;
                    $batch->save();
                }
            }
        } elseif ($transaksi->batch_barang_id) {
            // Backward compat: transaksi lama yang masih single-batch
            $batch = \App\Models\BatchBarang::find($transaksi->batch_barang_id);
            if ($batch) {
                $batch->stok_tersisa = (float) $batch->stok_tersisa + (float) $transaksi->jumlah;
                $batch->save();
            }
        }
    }

    public function downloadSuratJalan($id)
    {
        $pengeluaran = PengeluaranBarang::with([
            'transaksi.pengaju',
            'transaksi.disetujuiOleh',
            'transaksi.dieksekusiOleh',
            'transaksi.barang.satuan',
            'transaksi.batchAlokasi.batchBarang',
            'ruangLaboratorium',
        ])->findOrFail($id);

        $statusDiizinkan = ['BK-DISETUJUI', 'BK-MENUNGGU', 'BK-SELESAI'];
        if (!in_array($pengeluaran->kode_status_transaksi, $statusDiizinkan)) {
            return response()->json(['message' => 'Surat jalan hanya tersedia untuk transaksi yang sudah disetujui.'], 422);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.surat-jalan', [
            'pengeluaran' => $pengeluaran,
        ]);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'Surat-Jalan-SJ-' . str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) . '.pdf';
        return $pdf->download($filename);
    }

    public function downloadPdf($id)
    {
        $pengeluaran = PengeluaranBarang::with([
            'creator',
            'transaksi.pengaju',
            'transaksi.disetujuiOleh',
            'transaksi.dieksekusiOleh',
            'transaksi.batchAlokasi.batchBarang',
            'ruangLaboratorium',
            'transaksi.barang.satuan'
        ])->findOrFail($id);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.pengeluaran-barang', [
            'pengeluaran' => $pengeluaran
        ]);

        $pdf->setPaper('A4', 'portrait');

        $filename = 'Bukti-Pengeluaran-PB-' . str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($filename);
    }
}
