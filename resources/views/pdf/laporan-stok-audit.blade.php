<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Audit Stok & Inventaris Bahan Laboratorium</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1e293b; line-height: 1.5; }
        .container { padding: 28px 36px; }

        .header { border-bottom: 3px double #0266a2; padding-bottom: 12px; margin-bottom: 18px; display: table; width: 100%; }
        .header-left { display: table-cell; vertical-align: middle; width: 70%; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; width: 30%; }
        .title { font-size: 15px; font-weight: bold; color: #0266a2; text-transform: uppercase; letter-spacing: 1.2px; }
        .subtitle { font-size: 10px; color: #64748b; margin-top: 2px; }
        .date-badge { display: inline-block; border: 1px solid #0266a2; border-radius: 6px; padding: 5px 12px; text-align: center; }
        .date-label { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .date-value { font-size: 11px; font-weight: bold; color: #0266a2; margin-top: 1px; }
        .print-date { font-size: 8px; color: #94a3b8; margin-top: 3px; }

        .summary { display: table; width: 100%; margin-bottom: 18px; }
        .summary-cell { display: table-cell; padding: 0 6px; }
        .summary-cell:first-child { padding-left: 0; }
        .summary-cell:last-child { padding-right: 0; }
        .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; text-align: center; background: #f8fafc; }
        .summary-label { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-value { font-size: 18px; font-weight: bold; color: #0266a2; margin-top: 3px; }
        .summary-value.amber { color: #d97706; }
        .summary-value.rose { color: #dc2626; }
        .summary-value.green { color: #16a34a; font-size: 13px; }

        .notice-bar { background-color: #fef9c3; border: 1px solid #fde68a; border-radius: 5px; padding: 7px 12px; font-size: 10px; color: #92400e; margin-bottom: 16px; }

        .section-title { font-size: 11px; font-weight: bold; color: #0266a2; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        thead th { background-color: #0266a2; color: white; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; padding: 8px 10px; text-align: left; }
        thead th.center { text-align: center; }
        thead th.right { text-align: right; }
        tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 9.5px; vertical-align: middle; }
        tbody tr:nth-child(even) { background-color: #f8fafc; }
        tbody tr.row-menipis { background-color: #fffbeb !important; }
        tbody tr.row-habis { background-color: #fff1f2 !important; }
        tbody tr:last-child td { border-bottom: 2px solid #0266a2; }

        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
        .badge-aman { background-color: #dcfce7; color: #15803d; }
        .badge-menipis { background-color: #fef9c3; color: #a16207; }
        .badge-habis { background-color: #fee2e2; color: #dc2626; }
        .badge-expired { background-color: #fee2e2; color: #dc2626; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .mono { font-family: 'DejaVu Sans Mono', monospace; font-size: 9px; }

        .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="container">

    {{-- Header --}}
    <div class="header">
        <div class="header-left">
            <div class="title">Audit Stok &amp; Inventaris Bahan Laboratorium</div>
            <div class="subtitle">Lab Inventory Hub &mdash; Institut Teknologi Kalimantan</div>
        </div>
        <div class="header-right">
            <div class="date-badge">
                <div class="date-label">Tanggal Audit</div>
                <div class="date-value">{{ now()->locale('id')->isoFormat('D MMMM Y') }}</div>
                <div class="print-date">Dicetak: {{ now()->locale('id')->isoFormat('D MMM Y, HH:mm') }}</div>
            </div>
        </div>
    </div>

    {{-- Summary --}}
    <div class="summary">
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Total Jenis Bahan</div>
                <div class="summary-value">{{ number_format($summary['total_jenis_barang']) }}</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Stok Menipis</div>
                <div class="summary-value amber">{{ number_format($summary['total_stok_menipis']) }}</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Batch Kadaluarsa</div>
                <div class="summary-value rose">{{ number_format($summary['total_kadaluarsa']) }}</div>
            </div>
        </div>
        <div class="summary-cell">
            <div class="summary-card">
                <div class="summary-label">Nilai Inventaris</div>
                <div class="summary-value green">Rp {{ number_format($summary['total_nilai_inventaris'], 0, ',', '.') }}</div>
            </div>
        </div>
    </div>

    @if($summary['total_stok_menipis'] > 0 || $summary['total_kadaluarsa'] > 0)
    <div class="notice-bar">
        &#9888;&nbsp;
        @if($summary['total_stok_menipis'] > 0)
            Terdapat <strong>{{ $summary['total_stok_menipis'] }} jenis bahan</strong> dengan stok menipis.&nbsp;
        @endif
        @if($summary['total_kadaluarsa'] > 0)
            Terdapat <strong>{{ $summary['total_kadaluarsa'] }} batch</strong> yang sudah kadaluarsa.
        @endif
        Segera lakukan tindakan pengadaan atau penghapusan bahan.
    </div>
    @endif

    {{-- Stock Table --}}
    <div class="section-title">Daftar Stok Bahan Laboratorium</div>
    <table>
        <thead>
            <tr>
                <th style="width:24px;">No</th>
                <th style="width:80px;">Kode</th>
                <th>Nama Barang / Bahan</th>
                <th style="width:85px;">Kategori</th>
                <th class="right" style="width:70px;">Stok</th>
                <th class="right" style="width:50px;">Min</th>
                <th class="center" style="width:65px;">Status</th>
                <th style="width:80px;">Lokasi</th>
                <th class="right" style="width:90px;">Nilai (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $i => $item)
            @php
                $rowClass = '';
                if ($item['status_stok'] === 'Menipis') $rowClass = 'row-menipis';
                if ($item['status_stok'] === 'Habis') $rowClass = 'row-habis';
                $badgeClass = $item['status_stok'] === 'Aman' ? 'badge-aman' : ($item['status_stok'] === 'Menipis' ? 'badge-menipis' : 'badge-habis');
            @endphp
            <tr class="{{ $rowClass }}">
                <td class="text-center">{{ $i + 1 }}</td>
                <td class="mono">{{ $item['kode_barang'] }}</td>
                <td>
                    <strong>{{ $item['nama_barang'] }}</strong>
                    @if($item['batch_kadaluarsa'] > 0)
                        <br><span style="font-size: 8px; color: #dc2626;">&#9888; {{ $item['batch_kadaluarsa'] }} batch kadaluarsa</span>
                    @endif
                </td>
                <td>{{ $item['kategori'] }}</td>
                <td class="text-right" style="font-weight: bold;">
                    {{ number_format($item['total_stok']) }}
                    <span style="font-size: 8px; color: #94a3b8; font-weight: normal;">{{ $item['satuan'] }}</span>
                </td>
                <td class="text-right" style="color: #94a3b8;">{{ number_format($item['stok_minimum']) }}</td>
                <td class="text-center">
                    <span class="badge {{ $badgeClass }}">{{ $item['status_stok'] }}</span>
                </td>
                <td>{{ $item['lokasi'] }}</td>
                <td class="text-right">{{ number_format($item['total_nilai'], 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align:center; padding: 20px; color: #94a3b8;">Tidak ada data stok barang</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Lab Inventory Hub &nbsp;|&nbsp; Audit Stok &amp; Inventaris &nbsp;|&nbsp;
        Total {{ count($data) }} jenis bahan &nbsp;|&nbsp;
        Digenerate otomatis pada {{ now()->format('d/m/Y H:i:s') }}
    </div>

</div>
</body>
</html>
