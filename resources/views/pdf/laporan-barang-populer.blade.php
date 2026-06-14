<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Tren Permintaan Bahan Laboratorium</title>
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

        .info-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 14px; margin-bottom: 18px; font-size: 10px; color: #1d4ed8; }

        .section-title { font-size: 11px; font-weight: bold; color: #0266a2; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        thead th { background-color: #0266a2; color: white; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 10px; text-align: left; }
        thead th.center { text-align: center; }
        thead th.right { text-align: right; }
        tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 9.5px; vertical-align: middle; }
        tbody tr:nth-child(even) { background-color: #f8fafc; }
        tbody tr:last-child td { border-bottom: 2px solid #0266a2; }

        .rank-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: bold; }
        .rank-gold { background-color: #fef9c3; color: #a16207; }
        .rank-normal { background-color: #f1f5f9; color: #64748b; }
        .freq-badge { display: inline-block; background-color: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; }

        .bar-wrapper { background-color: #f1f5f9; border-radius: 4px; height: 10px; overflow: hidden; }
        .bar-fill { background-color: #0266a2; height: 100%; border-radius: 4px; }

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
            <div class="title">Tren Permintaan Bahan Laboratorium</div>
            <div class="subtitle">Lab Inventory Hub &mdash; Institut Teknologi Kalimantan</div>
        </div>
        <div class="header-right">
            <div class="period-badge">
                <div class="period-label">Periode Laporan</div>
                <div class="period-value">{{ $dari->locale('id')->isoFormat('MMMM Y') }}</div>
                <div class="print-date">Dicetak: {{ now()->locale('id')->isoFormat('D MMM Y, HH:mm') }}</div>
            </div>
        </div>
    </div>

    <div class="info-box">
        &#9432;&nbsp; Laporan ini menampilkan bahan laboratorium yang paling sering diminta berdasarkan frekuensi transaksi pengeluaran pada periode yang dipilih.
    </div>

    {{-- Ranking Table --}}
    <div class="section-title">Ranking Bahan Paling Sering Diminta (Top {{ count($data) }})</div>
    <table>
        <thead>
            <tr>
                <th class="center" style="width:36px;">#</th>
                <th>Nama Bahan / Barang</th>
                <th style="width:100px;">Kategori</th>
                <th class="center" style="width:80px;">Frekuensi</th>
                <th class="right" style="width:90px;">Total Jumlah</th>
                <th style="width:60px;">Satuan</th>
                <th style="width:100px;">Proporsi</th>
            </tr>
        </thead>
        <tbody>
            @php
                $maxFrekuensi = collect($data)->max('frekuensi') ?: 1;
            @endphp
            @forelse($data as $item)
            <tr>
                <td class="text-center">
                    <span class="rank-badge {{ $item['ranking'] <= 3 ? 'rank-gold' : 'rank-normal' }}">{{ $item['ranking'] }}</span>
                </td>
                <td style="font-weight: bold;">{{ $item['nama_barang'] }}</td>
                <td>{{ $item['kategori'] }}</td>
                <td class="text-center">
                    <span class="freq-badge">{{ $item['frekuensi'] }}x</span>
                </td>
                <td class="text-right" style="font-weight: bold;">{{ number_format($item['total_jumlah']) }}</td>
                <td>{{ $item['satuan'] }}</td>
                <td>
                    @php $persen = round(($item['frekuensi'] / $maxFrekuensi) * 100); @endphp
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="width: {{ $persen }}%;"></div>
                    </div>
                    <div style="font-size: 8px; color: #64748b; margin-top: 2px;">{{ $persen }}% dari tertinggi</div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data permintaan untuk periode ini</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Lab Inventory Hub &nbsp;|&nbsp; Tren Permintaan Bahan Periode {{ $dari->locale('id')->isoFormat('MMMM Y') }}
        &nbsp;|&nbsp; Digenerate otomatis pada {{ now()->format('d/m/Y H:i:s') }}
    </div>

</div>
</body>
</html>
