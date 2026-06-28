<?php

namespace App\Exports;

use App\Models\Penyedia;
use App\Models\JenisKegiatan;
use App\Models\Satuan;
use App\Models\Barang;
use App\Models\Laboran;
use App\Models\User;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class TemplateBarangMasukExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Template Barang Masuk' => new TemplateBarangMasukSheet(),
            'Master Vendor' => new MasterVendorSheet(),
            'Master Jenis Kegiatan' => new MasterJenisKegiatanSheet(),
            'Master Satuan' => new MasterSatuanSheet(),
            'Master Laboran' => new MasterLaboranSheet(),
            'Master Petugas Gudang' => new MasterPetugasGudangSheet(),
            'Master Barang' => new MasterBarangSheet(),
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
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
{
    public function title(): string
    {
        return 'Template Barang Masuk';
    }

    public function array(): array
    {
        return [
            // Row 1: Title
            ['TEMPLATE UPLOAD BARANG MASUK — SIGMA (Sistem Informasi Gudang, Manajemen dan Analitik) | UPA Laboratorium Terpadu ITK', '', '', '', '', '', '', '', '', '', '', ''],
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

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                // Helper function to create validation
                $createValidation = function($formula) {
                    $validation = new DataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                    $validation->setAllowBlank(true);
                    $validation->setShowInputMessage(true);
                    $validation->setShowErrorMessage(true);
                    $validation->setShowDropDown(true);
                    $validation->setFormula1($formula);
                    return $validation;
                };

                // Column E: Satuan (From Master Satuan Column A)
                $satuanValidation = $createValidation('\'Master Satuan\'!$A$2:$A$200');
                $sheet->setDataValidation('E5:E1000', $satuanValidation);

                // Column F: Kode Pemasok (From Master Vendor Column A)
                $vendorValidation = $createValidation('\'Master Vendor\'!$A$2:$A$1000');
                $sheet->setDataValidation('F5:F1000', $vendorValidation);

                // Column G: Jenis Kegiatan (From Master Jenis Kegiatan Column A)
                $kegiatanValidation = $createValidation('\'Master Jenis Kegiatan\'!$A$2:$A$50');
                $sheet->setDataValidation('G5:G1000', $kegiatanValidation);

                // Column I: PIC Barang Masuk (From Master Laboran Column A)
                $picValidation = $createValidation('\'Master Laboran\'!$A$2:$A$500');
                $sheet->setDataValidation('I5:I1000', $picValidation);

                // Column J: Petugas Gudang (From Master Petugas Gudang Column A)
                $petugasValidation = $createValidation('\'Master Petugas Gudang\'!$A$2:$A$500');
                $sheet->setDataValidation('J5:J1000', $petugasValidation);
            },
        ];
    }
}

/**
 * Sheet 2: Master Vendor (for reference)
 */
class MasterVendorSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
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

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function (\Maatwebsite\Excel\Events\AfterSheet $event) {
                $event->sheet->getDelegate()->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
            },
        ];
    }
}

/**
 * Sheet 3: Master Jenis Kegiatan
 */
class MasterJenisKegiatanSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
{
    public function title(): string
    {
        return 'Master Jenis Kegiatan';
    }

    public function array(): array
    {
        $rows = [
            ['Nama Kegiatan', 'Keterangan', 'Wajib Link Pengadaan?'],
        ];

        $kegiatans = JenisKegiatan::where('aktif', true)->orderBy('nama')->get();
        foreach ($kegiatans as $k) {
            $rows[] = [
                $k->nama,
                $k->keterangan ?? '-',
                $k->wajib_link_pengadaan ? 'Ya' : 'Tidak'
            ];
        }

        if (count($rows) === 1) {
            $rows[] = ['(Belum ada data jenis kegiatan aktif)', '', ''];
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30,
            'B' => 40,
            'C' => 25,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1:C1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function (\Maatwebsite\Excel\Events\AfterSheet $event) {
                $event->sheet->getDelegate()->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
            },
        ];
    }
}

/**
 * Sheet 4: Master Satuan
 */
class MasterSatuanSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
{
    public function title(): string
    {
        return 'Master Satuan';
    }

    public function array(): array
    {
        $rows = [
            ['Simbol Satuan', 'Nama Satuan'],
        ];

        $satuans = Satuan::orderBy('simbol')->get();
        foreach ($satuans as $s) {
            $rows[] = [$s->simbol, $s->nama_satuan];
        }

        if (count($rows) === 1) {
            $rows[] = ['(Belum ada data satuan)', ''];
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 30,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function (\Maatwebsite\Excel\Events\AfterSheet $event) {
                $event->sheet->getDelegate()->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
            },
        ];
    }
}

/**
 * Sheet 5: Master Laboran
 */
class MasterLaboranSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
{
    public function title(): string
    {
        return 'Master Laboran';
    }

    public function array(): array
    {
        $rows = [
            ['Daftar Nama Laboran'],
        ];

        $laborans = \App\Models\Laboran::with('user')->get()->pluck('user.name')->filter()->values();
        
        if (count($laborans) === 0) {
            $rows[] = ['(Tidak ada data)'];
        } else {
            foreach ($laborans as $l) {
                $rows[] = [$l];
            }
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function (\Maatwebsite\Excel\Events\AfterSheet $event) {
                $event->sheet->getDelegate()->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
            },
        ];
    }
}

/**
 * Sheet 6: Master Petugas Gudang
 */
class MasterPetugasGudangSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths,
    \Maatwebsite\Excel\Concerns\WithEvents
{
    public function title(): string
    {
        return 'Master Petugas Gudang';
    }

    public function array(): array
    {
        $rows = [
            ['Daftar Nama Petugas Gudang'],
        ];

        $petugases = \App\Models\User::whereHas('roles', function($q){ 
            $q->where('name', 'Petugas Gudang'); 
        })->get()->pluck('name')->filter()->values();
        
        if (count($petugases) === 0) {
            $rows[] = ['(Tidak ada data)'];
        } else {
            foreach ($petugases as $p) {
                $rows[] = [$p];
            }
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }

    public function registerEvents(): array
    {
        return [
            \Maatwebsite\Excel\Events\AfterSheet::class => function (\Maatwebsite\Excel\Events\AfterSheet $event) {
                $event->sheet->getDelegate()->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
            },
        ];
    }
}

/**
 * Sheet 7: Master Barang (Kamus Referensi)
 */
class MasterBarangSheet implements
    \Maatwebsite\Excel\Concerns\FromArray,
    \Maatwebsite\Excel\Concerns\WithTitle,
    \Maatwebsite\Excel\Concerns\WithStyles,
    \Maatwebsite\Excel\Concerns\WithColumnWidths
{
    public function title(): string
    {
        return 'Master Barang';
    }

    public function array(): array
    {
        $rows = [
            ['Kode Barang', 'Nama Barang', 'Spesifikasi', 'Kategori', 'Satuan Default'],
        ];

        $barangs = \App\Models\Barang::with(['kategori', 'satuan'])->orderBy('kode_barang')->get();
        foreach ($barangs as $b) {
            $rows[] = [
                $b->kode_barang,
                $b->nama_barang,
                $b->spesifikasi ?? '-',
                $b->kategori->nama_kategori ?? '-',
                $b->satuan->nama_satuan ?? '-'
            ];
        }

        if (count($rows) === 1) {
            $rows[] = ['(Belum ada data barang)', '', '', '', ''];
        }

        return $rows;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 45,
            'C' => 40,
            'D' => 25,
            'E' => 15,
        ];
    }

    public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet): array
    {
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0266A2']],
        ]);

        return [];
    }
}
