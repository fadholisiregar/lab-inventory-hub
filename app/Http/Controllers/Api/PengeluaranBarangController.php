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

        $query = PengeluaranBarang::with(['statusTransaksi', 'creator', 'transaksi.pengaju', 'transaksi.disetujuiOleh', 'transaksi.dieksekusiOleh', 'transaksi.barang.satuan', 'transaksi.barang.kategori', 'transaksi.batchBarang', 'ruangLaboratorium'])
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
                $transaksi->dieksekusi_oleh = $petugas->user_id;
                $transaksi->disetujui_oleh = $request->user()->id;
                
                // Potong stok master saat disetujui untuk booking
                $master = Barang::find($transaksi->barang_id);
                
                if (!$master || $master->total_stok < $transaksi->jumlah) {
                    throw new \Exception("Stok tidak mencukupi untuk barang: " . ($master ? $master->nama_barang : 'Unknown'));
                }
                
                $transaksi->stok_sebelum = $master->total_stok;
                $transaksi->stok_sesudah = $master->total_stok - $transaksi->jumlah;
                
                $master->total_stok -= $transaksi->jumlah;
                $master->save();
                
                $transaksi->save();
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

        DB::beginTransaction();
        try {
            $pengeluaran = PengeluaranBarang::with('transaksi')->findOrFail($id);
            $transaksi = $pengeluaran->transaksi;
            
            $statusDisetujui = \App\Models\StatusTransaksi::where('kode', 'BK-DISETUJUI')->first();

            if ($pengeluaran->kode_status_transaksi !== $statusDisetujui->kode) {
                return response()->json(['message' => 'Transaksi belum disetujui atau sudah dieksekusi.'], 400);
            }

            // Removed check so any Petugas Gudang can execute the approved request

            $statusMenunggu = \App\Models\StatusTransaksi::where('kode', 'BK-MENUNGGU')->first();
            $pengeluaran->kode_status_transaksi = $statusMenunggu->kode;
            $pengeluaran->save();

            DB::commit();
            return response()->json(['message' => 'Barang berhasil disiapkan. Menunggu konfirmasi Laboran.']);
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

            $statusSelesai = \App\Models\StatusTransaksi::where('kode', 'BK-SELESAI')->first();
            $pengeluaran->kode_status_transaksi = $statusSelesai->kode;
            
            $transaksi = $pengeluaran->transaksi;
            if ($transaksi) {
                $transaksi->tanda_terima = true;
                $transaksi->save();
            }
            
            $pengeluaran->save();

            DB::commit();
            return response()->json(['message' => 'Penerimaan barang berhasil dikonfirmasi. Transaksi selesai.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan.', 'error' => $e->getMessage()], 500);
        }
    }

    public function downloadPdf($id)
    {
        $pengeluaran = PengeluaranBarang::with([
            'creator',
            'transaksi.pengaju',
            'transaksi.disetujuiOleh',
            'transaksi.dieksekusiOleh',
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
