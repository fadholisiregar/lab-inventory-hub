<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Analisis Efisiensi Pemakaian Bahan</title>
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
        .summary-cell { display: table-cell; padding: 0 6px; }
        .summary-cell:first-child { padding-left: 0; }
        .summary-cell:last-child { padding-right: 0; }
        .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; text-align: center; background: #f8fafc; }
        .summary-label { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-value { font-size: 18px; font-weight: bold; color: #0266a2; margin-top: 3px; }
        .summary-value.green { color: #16a34a; }
        .summary-value.amber { color: #d97706; }
        .summary-value.rose { color: #dc2626; }

        .legend { display: table; width: 100%; margin-bottom: 14px; }
        .legend-item { display: table-cell; padding: 6px 10px; border-radius: 6px; font-size: 9px; text-align: center; }
        .legend-hemat { background-color: #dcfce7; color: #15803d; }
        .legend-sesuai { background-color: #dbeafe; color: #1d4ed8; }
        .legend-boros { background-color: #fee2e2; color: #dc2626; }
        .legend-spacer { display: table-cell; width: 8px; }

        .section-title { font-size: 11px; font-weight: bold; color: #0266a2; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        thead th { background-color: #0266a2; color: white; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 10px; text-align: left; }
        thead th.center { text-align: center; }
        thead th.right { text-align: right; }
        tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 9.5px; vertical-align: middle; }
        tbody tr:nth-child(even) { background-color: #f8fafc; }
        tbody tr:last-child td { border-bottom: 2px solid #0266a2; }

        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
        .badge-hemat { background-color: #dcfce7; color: #15803d; }
        .badge-sesuai { background-color: #dbeafe; color: #1d4ed8; }
        .badge-boros { background-color: #fee2e2; color: #dc2626; }

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
            <div class="title">Analisis Efisiensi Pemakaian Bahan</div>
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

    {{-- Summary --}}
    <div class="summary">
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Rata-rata Efisiensi</div>
                <div class="summary-value {{ $summary['rata_rata_efisiensi'] <= 100 ? 'green' : 'rose' }}">{{ $summary['rata_rata_efisiensi'] }}%</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Total Rencana</div>
                <div class="summary-value">{{ number_format($summary['total_rencana']) }}</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Total Realisasi</div>
                <div class="summary-value amber">{{ number_format($summary['total_realisasi']) }}</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Jumlah Jenis Bahan</div>
                <div class="summary-value">{{ number_format($summary['total_barang']) }}</div>
            </div>
        </div>
    </div>

    {{-- Legend --}}
    <div class="legend">
        <div class="legend-item legend-hemat">&#10003; Hemat: Realisasi &lt; Rencana (&lt;100%)</div>
        <div class="legend-spacer"></div>
        <div class="legend-item legend-sesuai">&#10003; Sesuai: Realisasi = Rencana (100%)</div>
        <div class="legend-spacer"></div>
        <div class="legend-item legend-boros">&#9888; Boros: Realisasi &gt; Rencana (&gt;100%)</div>
    </div>

    {{-- Detail Table --}}
    <div class="section-title">Detail Efisiensi per Jenis Bahan</div>
    <table>
        <thead>
            <tr>
                <th style="width:24px;">No</th>
                <th>Nama Barang / Bahan</th>
                <th style="width:55px;">Satuan</th>
                <th class="right" style="width:75px;">Rencana</th>
                <th class="right" style="width:75px;">Realisasi</th>
                <th class="right" style="width:70px;">Selisih</th>
                <th class="center" style="width:70px;">Efisiensi</th>
                <th class="center" style="width:65px;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $item)
            @php
                $selisihColor = $item['selisih'] > 0 ? '#dc2626' : '#16a34a';
                $selisihPrefix = $item['selisih'] > 0 ? '+' : '';
                $efisiensiColor = $item['efisiensi_persen'] <= 80 ? '#16a34a' : ($item['efisiensi_persen'] <= 100 ? '#1d4ed8' : '#dc2626');
            @endphp
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td style="font-weight: bold;">{{ $item['nama_barang'] }}</td>
                <td>{{ $item['satuan'] }}</td>
                <td class="text-right">{{ number_format($item['jumlah_rencana']) }}</td>
                <td class="text-right">{{ number_format($item['jumlah_realisasi']) }}</td>
                <td class="text-right" style="color: {{ $selisihColor }}; font-weight: bold;">
                    {{ $selisihPrefix }}{{ number_format($item['selisih']) }}
                </td>
                <td class="text-center" style="color: {{ $efisiensiColor }}; font-weight: bold;">{{ $item['efisiensi_persen'] }}%</td>
                <td class="text-center">
                    @php
                        $badgeClass = $item['status'] === 'Hemat' ? 'badge-hemat' : ($item['status'] === 'Sesuai' ? 'badge-sesuai' : 'badge-boros');
                    @endphp
                    <span class="badge {{ $badgeClass }}">{{ $item['status'] }}</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data efisiensi untuk periode ini</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Lab Inventory Hub &nbsp;|&nbsp; Analisis Efisiensi Pemakaian Bahan Periode {{ $dari->locale('id')->isoFormat('MMMM Y') }}
        &nbsp;|&nbsp; Digenerate otomatis pada {{ now()->format('d/m/Y H:i:s') }}
    </div>

</div>
</body>
</html>
