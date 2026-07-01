<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rekap Transaksi Bahan Laboratorium</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1e293b; line-height: 1.5; }
        .container { padding: 28px 36px; }

        .header { border-bottom: 3px double #0266a2; padding-bottom: 12px; margin-bottom: 18px; display: table; width: 100%; }
        .header-left { display: table-cell; vertical-align: middle; width: 70%; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; width: 30%; }
        .title { font-size: 15px; font-weight: bold; color: #0266a2; text-transform: uppercase; letter-spacing: 1.2px; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .period-badge { display: inline-block; border: 1px solid #0266a2; border-radius: 6px; padding: 5px 12px; text-align: center; }
        .period-label { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .period-value { font-size: 11px; font-weight: bold; color: #0266a2; margin-top: 1px; }
        .print-date { font-size: 8px; color: #94a3b8; margin-top: 3px; }

        .summary { display: table; width: 100%; margin-bottom: 18px; }
        .summary-row { display: table-row; }
        .summary-cell { display: table-cell; padding: 0 6px; }
        .summary-cell:first-child { padding-left: 0; }
        .summary-cell:last-child { padding-right: 0; }
        .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; text-align: center; background: #f8fafc; }
        .summary-label { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-value { font-size: 18px; font-weight: bold; color: #0266a2; margin-top: 3px; }
        .summary-value.green { color: #16a34a; }
        .summary-value.amber { color: #d97706; }
        .summary-value.purple { color: #7c3aed; font-size: 13px; }

        .section-title { font-size: 11px; font-weight: bold; color: #0266a2; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        thead th { background-color: #0266a2; color: white; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 10px; text-align: left; }
        thead th.center { text-align: center; }
        tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 9.5px; vertical-align: top; }
        tbody tr:nth-child(even) { background-color: #f8fafc; }
        tbody tr:last-child td { border-bottom: 2px solid #0266a2; }

        .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 8.5px; font-weight: bold; text-transform: uppercase; }
        .badge-masuk { background-color: #dcfce7; color: #15803d; }
        .badge-keluar { background-color: #fef9c3; color: #a16207; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }

        .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="container">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="title">Rekap Transaksi Bahan Laboratorium</div>
            <div class="subtitle">SIGMA &mdash; Institut Teknologi Kalimantan</div>
        </div>
        <div class="header-right">
            <div class="period-badge">
                <div class="period-label">Periode Laporan</div>
                <div class="period-value">{{ $dari->locale('id')->isoFormat('MMMM Y') }}</div>
                <div class="print-date">Dicetak: {{ now()->locale('id')->isoFormat('D MMM Y, HH:mm') }}</div>
            </div>
        </div>
    </div>

    {{-- Summary --}}
    <div class="summary">
        <div class="summary-row">
            <div class="summary-cell">
                <div class="summary-card">
                    <div class="summary-label">Total Transaksi</div>
                    <div class="summary-value">{{ number_format($summary['total_transaksi']) }}</div>
                </div>
            </div>
            <div class="summary-cell">
                <div class="summary-card">
                    <div class="summary-label">Barang Masuk</div>
                    <div class="summary-value green">{{ number_format($summary['total_masuk']) }}</div>
                </div>
            </div>
            <div class="summary-cell">
                <div class="summary-card">
                    <div class="summary-label">Barang Keluar</div>
                    <div class="summary-value amber">{{ number_format($summary['total_keluar']) }}</div>
                </div>
            </div>
            <div class="summary-cell">
                <div class="summary-card">
                    <div class="summary-label">Nilai Penerimaan</div>
                    <div class="summary-value purple">Rp {{ number_format($summary['nilai_masuk'], 0, ',', '.') }}</div>
                </div>
            </div>
        </div>
    </div>

    {{-- Detail Table --}}
    <div class="section-title">Detail Transaksi Periode {{ $dari->locale('id')->isoFormat('D MMMM Y') }} &mdash; {{ $sampai->locale('id')->isoFormat('D MMMM Y') }}</div>
    <table>
        <thead>
            <tr>
                <th class="center" style="width:28px;">No</th>
                <th style="width:110px;">Tanggal</th>
                <th class="center" style="width:55px;">Jenis</th>
                <th>Nama Barang</th>
                <th class="center" style="width:80px;">Jumlah</th>
                <th style="width:90px;">Status</th>
                <th style="width:110px;">Pengaju</th>
            </tr>
        </thead>
        <tbody>
            @forelse($detail as $i => $d)
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td>{{ $d['tanggal'] }}</td>
                <td class="text-center">
                    <span class="badge {{ $d['jenis'] === 'Masuk' ? 'badge-masuk' : 'badge-keluar' }}">{{ $d['jenis'] }}</span>
                </td>
                <td>{{ $d['barang'] }}</td>
                <td class="text-center">{{ number_format($d['jumlah']) }} {{ $d['satuan'] }}</td>
                <td>{{ $d['status'] }}</td>
                <td>{{ $d['pengaju'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data transaksi untuk periode ini</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        SIGMA &nbsp;|&nbsp; Rekap Transaksi Periode {{ $dari->locale('id')->isoFormat('MMMM Y') }}
        &nbsp;|&nbsp; Digenerate otomatis pada {{ now()->format('d/m/Y H:i:s') }}
    </div>

</div>
</body>
</html>
