<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Surat Jalan</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.5;
        }
        .container { padding: 28px 40px; }

        /* Header */
        .header {
            border-bottom: 3px double #0266a2;
            padding-bottom: 14px;
            margin-bottom: 18px;
            display: table;
            width: 100%;
        }
        .header-left { display: table-cell; vertical-align: middle; width: 70%; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; width: 30%; }
        .header-title {
            font-size: 17px;
            font-weight: bold;
            color: #0266a2;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .header-subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
        .doc-number-box {
            border: 1px solid #0266a2;
            border-radius: 6px;
            padding: 6px 12px;
            display: inline-block;
            text-align: center;
        }
        .doc-number-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .doc-number-value { font-size: 13px; font-weight: bold; color: #0266a2; margin-top: 2px; }
        .doc-date { font-size: 9px; color: #94a3b8; margin-top: 4px; }

        /* Info section */
        .info-wrapper {
            display: table;
            width: 100%;
            margin-bottom: 18px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }
        .info-col { display: table-cell; width: 50%; padding: 12px 16px; vertical-align: top; }
        .info-col:first-child { border-right: 1px solid #e2e8f0; }
        .info-col-title {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            color: #0266a2;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-grid { width: 100%; border-collapse: collapse; }
        .info-grid td { padding: 3px 0; vertical-align: top; }
        .info-grid .lbl { font-weight: bold; color: #64748b; width: 130px; font-size: 10px; }
        .info-grid .sep { width: 12px; text-align: center; color: #94a3b8; }
        .info-grid .val { color: #1e293b; font-size: 10px; }

        /* Notice bar */
        .notice-bar {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 5px;
            padding: 7px 12px;
            font-size: 10px;
            color: #1d4ed8;
            margin-bottom: 16px;
        }

        /* Table */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #0266a2;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .items-table thead th {
            background-color: #0266a2;
            color: #fff;
            font-size: 9px;
            text-transform: uppercase;
            padding: 8px 10px;
            text-align: left;
            letter-spacing: 0.5px;
        }
        .items-table tbody td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
        }
        .items-table tbody tr:nth-child(even) { background-color: #f8fafc; }
        .items-table tbody tr:last-child td { border-bottom: 2px solid #0266a2; }
        .items-table .col-check {
            border: 1px solid #94a3b8;
            min-height: 20px;
            min-width: 50px;
            height: 22px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* Signatures */
        .sig-section { margin-top: 28px; }
        .sig-wrapper { display: table; width: 100%; }
        .sig-box { display: table-cell; width: 50%; text-align: center; padding: 0 20px; }
        .sig-title {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .sig-subtitle { font-size: 9px; color: #94a3b8; margin-bottom: 70px; }
        .sig-line {
            border-top: 1px solid #1e293b;
            padding-top: 5px;
            font-weight: bold;
            font-size: 11px;
            display: inline-block;
            min-width: 160px;
        }
        .sig-nip { font-size: 9px; color: #64748b; margin-top: 2px; font-weight: normal; }

        /* Footer */
        .footer {
            margin-top: 24px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 8.5px;
            color: #94a3b8;
        }

        /* Watermark notice */
        .urgent-label {
            display: inline-block;
            background-color: #fef9c3;
            border: 1px solid #fde68a;
            color: #92400e;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
<div class="container">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="header-title">Surat Jalan Pengeluaran Bahan <span class="urgent-label">Laboratorium</span></div>
            <div class="header-subtitle">Lab Inventory Hub &mdash; Institut Teknologi Kalimantan</div>
        </div>
        <div class="header-right">
            <div class="doc-number-box">
                <div class="doc-number-label">Nomor Surat Jalan</div>
                <div class="doc-number-value">SJ-{{ str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div class="doc-date">Dicetak: {{ now()->locale('id')->isoFormat('D MMMM Y, HH:mm') }}</div>
            </div>
        </div>
    </div>

    {{-- Info --}}
    <div class="info-wrapper">
        <div class="info-col">
            <div class="info-col-title">Informasi Permintaan</div>
            <table class="info-grid">
                <tr>
                    <td class="lbl">Tanggal Disetujui</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->updated_at ? $pengeluaran->updated_at->locale('id')->isoFormat('D MMMM Y') : '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">No. Transaksi</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->transaksi->transaction_id ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Pengaju (Laboran)</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->transaksi->pengaju->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Ruang Lab</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->ruangLaboratorium->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Jenis Kegiatan</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->jenis_kegiatan ?? '-' }}</td>
                </tr>
            </table>
        </div>
        <div class="info-col">
            <div class="info-col-title">Detail Kegiatan</div>
            <table class="info-grid">
                <tr>
                    <td class="lbl">Judul Kegiatan</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->judul_kegiatan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Prodi / Mitra</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->prodi_mitra ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Keperluan</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->transaksi->keperluan ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Petugas Gudang</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->transaksi->dieksekusiOleh->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="lbl">Disetujui Oleh</td>
                    <td class="sep">:</td>
                    <td class="val">{{ $pengeluaran->transaksi->disetujuiOleh->name ?? '-' }}</td>
                </tr>
            </table>
        </div>
    </div>

    {{-- Notice --}}
    <div class="notice-bar">
        &#9432;&nbsp; Petugas gudang harap mencocokkan barang berikut sebelum diserahkan kepada laboran. Kolom <strong>Jumlah Diserahkan</strong> diisi sesuai fisik yang ada.
    </div>

    {{-- Daftar Barang --}}
    <div class="section-title">Daftar Barang yang Dikeluarkan</div>
    <table class="items-table">
        <thead>
            <tr>
                <th class="text-center" style="width:30px;">No</th>
                <th style="width:90px;">Kode Barang</th>
                <th>Nama Barang</th>
                <th class="text-center" style="width:70px;">Jumlah Diminta</th>
                <th style="width:60px;">Satuan</th>
                <th class="text-center" style="width:80px;">Jumlah Diserahkan</th>
                <th style="width:80px;">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @php
                $barang   = $pengeluaran->transaksi->barang ?? null;
                $alokasis = $pengeluaran->transaksi->batchAlokasi ?? collect();
                $jumlahTotal = $pengeluaran->transaksi->jumlah ?? 0;
            @endphp
            @if($alokasis->count() > 0)
                @foreach($alokasis as $index => $alokasi)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $barang->kode_barang ?? '-' }}</td>
                    <td>
                        {{ $barang->nama_barang ?? '-' }}
                        @if($alokasi->batchBarang)
                            <br><span style="font-size:9px; color:#64748b;">Batch: {{ $alokasi->batchBarang->kode_batch }}</span>
                        @endif
                    </td>
                    <td class="text-center">{{ $alokasi->jumlah_diambil }}</td>
                    <td>{{ $barang->satuan->simbol ?? $barang->satuan->nama_satuan ?? '-' }}</td>
                    <td class="col-check text-center"></td>
                    <td class="col-check"></td>
                </tr>
                @endforeach
            @else
                <tr>
                    <td class="text-center">1</td>
                    <td>{{ $barang->kode_barang ?? '-' }}</td>
                    <td>{{ $barang->nama_barang ?? '-' }}</td>
                    <td class="text-center">{{ $jumlahTotal }}</td>
                    <td>{{ $barang->satuan->simbol ?? $barang->satuan->nama_satuan ?? '-' }}</td>
                    <td class="col-check text-center"></td>
                    <td class="col-check"></td>
                </tr>
            @endif
        </tbody>
    </table>

    {{-- Tanda Tangan --}}
    <div class="sig-section">
        <div class="sig-wrapper">
            <div class="sig-box">
                <div class="sig-title">Petugas Gudang</div>
                <div class="sig-subtitle">Yang menyerahkan barang</div>
                <div class="sig-line">
                    {{ $pengeluaran->transaksi->dieksekusiOleh->name ?? '..............................' }}
                    @if($pengeluaran->transaksi->dieksekusiOleh)
                        <div class="sig-nip">NIP: {{ $pengeluaran->transaksi->dieksekusiOleh->nip_nik ?? '-' }}</div>
                    @endif
                </div>
            </div>
            <div class="sig-box">
                <div class="sig-title">Penerima (Laboran)</div>
                <div class="sig-subtitle">Yang menerima barang</div>
                <div class="sig-line">
                    {{ $pengeluaran->transaksi->pengaju->name ?? '..............................' }}
                    @if($pengeluaran->transaksi->pengaju)
                        <div class="sig-nip">NIP: {{ $pengeluaran->transaksi->pengaju->nip_nik ?? '-' }}</div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- Footer --}}
    <div class="footer">
        Dokumen ini digenerate otomatis oleh sistem Lab Inventory Hub &mdash; {{ now()->format('d/m/Y H:i:s') }}
        &nbsp;|&nbsp; Surat Jalan No. SJ-{{ str_pad($pengeluaran->id, 6, '0', STR_PAD_LEFT) }}
    </div>

</div>
</body>
</html>
