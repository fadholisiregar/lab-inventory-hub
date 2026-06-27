<?php

namespace App\Exports;

use App\Models\Penyedia;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TemplateBarangMasukExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Template Barang Masuk' => new TemplateBarangMasukSheet(),
            'Master Vendor' => new MasterVendorSheet(),
        ];
    }
}

/**
 * Sheet 1: Template Barang Masuk
 */
class TemplateBarangMasukSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths
{
    public function title(): string
    {
        return 'Template Barang Masuk';
    }

    public function array(): array
    {
        return [
            // Row 1: Title
            ['TEMPLATE UPLOAD BARANG MASUK — Lab Inventory Hub', '', '', '', '', '', '', '', '', '', '', ''],
            // Row 2: Column headers
            ['Tanggal *', 'Kode Barang *', 'Nama Barang *', 'Jumlah Masuk *', 'Satuan *', 'Kode Pemasok *', 'Jenis Kegiatan *', 'Harga Total Dibayar *', 'PIC Barang Masuk', 'Petugas Gudang *', 'Link Pengadaan', 'Keterangan'],
            // Row 3: Data type hints
            ['Date (DD/MM/YYYY)', 'Text (BK-XX-0000)', 'Text', 'Number (angka saja)', 'Dropdown (gram, mg, dll)', 'Text (VND-000-XXX)', 'Dropdown', 'Number (Rp, angka saja)', 'Text (dari master pengguna)', 'Text (dari master pengguna / login)', 'Text / URL', 'Text'],
            // Row 4: Instructions
            ['* = Wajib diisi', 'Kolom abu-abu = diisi otomatis oleh sistem, jangan diisi', 'Baris contoh (kuning) boleh dihapus sebelum upload', 'Harga: angka saja tanpa Rp, titik, atau koma ribuan (contoh: 1554000)', '', '', '', '', '', '', '', ''],
            // Row 5: Sample data
            ['15/09/2025', 'BK-OX-0012', 'Zinc Nitrate / Zn(NO3)2', '500', 'gram', 'VND-001-SUK', 'Pengadaan', '610500', '', '', '', ''],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 16,
            'B' => 18,
            'C' => 30,
            'D' => 16,
            'E' => 14,
            'F' => 18,
            'G' => 20,
            'H' => 22,
            'I' => 24,
            'J' => 24,
            'K' => 30,
            'L' => 20,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        // Title row - blue background
        $sheet->getStyle('A1:L1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);
        $sheet->mergeCells('A1:L1');

        // Header row - orange background
        $sheet->getStyle('A2:L2')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'E67E22']],
            'alignment' => ['horizontal' => 'center'],
        ]);

        // Data type hints - light gray
        $sheet->getStyle('A3:L3')->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => '666666']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F5F5F5']],
        ]);

        // Instructions row - light green
        $sheet->getStyle('A4:L4')->applyFromArray([
            'font' => ['size' => 9, 'color' => ['rgb' => '27AE60']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'EAFAF1']],
        ]);

        // Sample data row - light yellow
        $sheet->getStyle('A5:L5')->applyFromArray([
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'FFF9C4']],
        ]);

        return [];
    }
}

/**
 * Sheet 2: Master Vendor (for reference)
 */
class MasterVendorSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths
{
    public function title(): string
    {
        return 'Master Vendor';
    }

    public function array(): array
    {
        $rows = [
            ['Kode Penyedia', 'Nama Penyedia', 'Kontak', 'Alamat'],
        ];

        $penyedias = Penyedia::orderBy('kode_penyedia')->get();
        foreach ($penyedias as $s) {
            $rows[] = [$s->kode_penyedia ?? '-', $s->nama_penyedia, $s->kontak ?? '-', $s->alamat ?? '-'];
        }

        if (count($rows) === 1) {
            $rows[] = ['(Belum ada data penyedia)', '', '', ''];
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 30,
            'C' => 20,
            'D' => 40,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1:D1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }
}
