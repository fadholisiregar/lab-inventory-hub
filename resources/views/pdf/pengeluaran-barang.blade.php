<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Bukti Pengeluaran Barang</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.5;
        }
        .container {
            padding: 30px 40px;
        }

        /* Header */
        .header {
            text-align: center;
            border-bottom: 3px double #0266a2;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 16px;
            color: #0266a2;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }
        .header h2 {
            font-size: 13px;
            color: #555;
            font-weight: normal;
        }
        .header .doc-number {
            font-size: 10px;
            color: #888;
            margin-top: 6px;
        }

        /* Info Grid */
        .info-section {
            margin-bottom: 20px;
        }
        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }
        .info-grid td {
            padding: 4px 0;
            vertical-align: top;
        }
        .info-grid .label {
            font-weight: bold;
            color: #555;
            width: 160px;
        }
        .info-grid .separator {
            width: 15px;
            text-align: center;
        }
        .info-grid .value {
            color: #333;
        }

        /* Items Table */
        .items-section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #0266a2;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        .items-table thead th {
            background-color: #0266a2;
            color: #fff;
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
            letter-spacing: 0.5px;
        }
        .items-table tbody td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        .items-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .items-table tbody tr:last-child td {
            border-bottom: 2px solid #0266a2;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }

        /* Signatures */
        .signatures {
            margin-top: 40px;
            width: 100%;
            border-collapse: collapse;
        }
        .signatures td {
            width: 33.33%;
            text-align: center;
            padding: 10px 15px;
            vertical-align: top;
        }
        .signatures .sig-title {
            font-size: 10px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 60px;
        }
        .signatures .sig-name {
            font-weight: bold;
            font-size: 11px;
            border-top: 1px solid #333;
            padding-top: 5px;
            display: inline-block;
            min-width: 120px;
        }

        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 9px;
            color: #aaa;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-selesai {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-disetujui {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Lab Inventory Hub</h1>
            <h2>Bukti Pengeluaran Barang</h2>
            <div class="doc-number">No. Dokumen: PB-{{ str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) }} | Tanggal Cetak: {{ now()->format('d/m/Y H:i') }}</div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <table class="info-grid">
                <tr>
                    <td class="label">Tanggal Pengajuan</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->created_at ? $pengeluaran->created_at->format('d F Y, H:i') : '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Pengaju (Laboran)</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->pengaju->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Ruang Laboratorium</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->ruangLaboratorium->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Jenis Kegiatan</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->jenis_kegiatan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Judul Kegiatan</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->judul_kegiatan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Prodi / Mitra</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->prodi_mitra ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Keperluan</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->keperluan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Status</td>
                    <td class="separator">:</td>
                    <td class="value">
                        <span class="status-badge {{ $pengeluaran->status === 'Selesai' ? 'status-selesai' : ($pengeluaran->status === 'Disetujui' ? 'status-disetujui' : 'status-pending') }}">
                            {{ $pengeluaran->status }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="label">Disetujui Oleh</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->penyetuju->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Dieksekusi Oleh</td>
                    <td class="separator">:</td>
                    <td class="value">{{ $pengeluaran->eksekutor->name ?? '-' }}</td>
                </tr>
            </table>
        </div>

        <!-- Items Table -->
        <div class="items-section">
            <div class="section-title">Daftar Barang</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="text-center" style="width: 40px;">No</th>
                        <th>Nama Barang</th>
                        <th>Kode Batch</th>
                        <th class="text-center">Jumlah</th>
                        <th>Satuan</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $alokasis = $pengeluaran->transaksi->batchAlokasi ?? collect();
                        $barang   = $pengeluaran->transaksi->barang ?? null;
                    @endphp
                    @forelse($alokasis as $index => $alokasi)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $barang->nama_barang ?? '-' }}</td>
                        <td>{{ $alokasi->batchBarang->kode_batch ?? '-' }}</td>
                        <td class="text-center">{{ $alokasi->jumlah_diambil }}</td>
                        <td>{{ $barang->satuan->nama_satuan ?? '-' }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="text-center" style="padding: 20px; color: #999;">Tidak ada data barang</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Signatures -->
        <table class="signatures">
            <tr>
                <td>
                    <div class="sig-title">Pengaju (Laboran)</div>
                    <div class="sig-name">{{ $pengeluaran->pengaju->name ?? '..................' }}</div>
                </td>
                <td>
                    <div class="sig-title">Koordinator Gudang</div>
                    <div class="sig-name">{{ $pengeluaran->penyetuju->name ?? '..................' }}</div>
                </td>
                <td>
                    <div class="sig-title">Petugas Gudang</div>
                    <div class="sig-name">{{ $pengeluaran->eksekutor->name ?? '..................' }}</div>
                </td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            Dokumen ini dicetak secara otomatis oleh sistem Lab Inventory Hub &mdash; {{ now()->format('d/m/Y H:i:s') }}
        </div>
    </div>
</body>
</html>
