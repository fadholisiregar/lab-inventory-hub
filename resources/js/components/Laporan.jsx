import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    BarChart3,
    Calendar,
    Download,
    Search,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Package,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Filter,
    Box,
    Activity,
    Loader2,
    ShieldCheck,
    ArrowUpRight,
    Zap,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
} from "recharts";
import axios from "../lib/axios";
import toast from "react-hot-toast";

// ============================================================
// SHARED UTILITIES
// ============================================================

const MONTHS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

const formatCurrency = (num) => {
    if (num === null || num === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
};

const downloadBlob = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// ============================================================
// LOADING SKELETON
// ============================================================

const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-6 h-28"
                >
                    <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
            ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-80">
            <div className="h-4 bg-slate-200 rounded w-48 mb-6"></div>
            <div className="h-full bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

// ============================================================
// PERIOD FILTER COMPONENT
// ============================================================

const PeriodFilter = ({
    bulan,
    setBulan,
    tahun,
    setTahun,
    onApply,
    onDownload,
    isDownloading,
}) => (
    <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="border-none outline-none text-sm text-slate-700 bg-transparent cursor-pointer"
            >
                {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>
            <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="border-none outline-none text-sm text-slate-700 bg-transparent cursor-pointer"
            >
                {YEARS.map((y) => (
                    <option key={y} value={y}>
                        {y}
                    </option>
                ))}
            </select>
        </div>
        <button
            onClick={onApply}
            className="px-4 py-2 bg-[#0266a2] text-white rounded-xl text-sm font-medium hover:bg-[#015a8c] transition-colors shadow-sm"
        >
            Terapkan
        </button>
        {onDownload && (
            <button
                onClick={onDownload}
                disabled={isDownloading}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0266a2]" />
                ) : (
                    <Download className="w-4 h-4 text-[#0266a2]" />
                )}
                {isDownloading ? "Mengunduh..." : "Unduh PDF"}
            </button>
        )}
    </div>
);

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    subtitle,
}) => {
    const colorMap = {
        blue: {
            bg: "bg-blue-50",
            icon: "text-[#0266a2]",
            border: "border-blue-100",
        },
        green: {
            bg: "bg-emerald-50",
            icon: "text-emerald-600",
            border: "border-emerald-100",
        },
        orange: {
            bg: "bg-amber-50",
            icon: "text-amber-600",
            border: "border-amber-100",
        },
        red: {
            bg: "bg-rose-50",
            icon: "text-rose-600",
            border: "border-rose-100",
        },
        purple: {
            bg: "bg-violet-50",
            icon: "text-violet-600",
            border: "border-violet-100",
        },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 mb-1 truncate">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                        {value}
                    </h3>
                </div>
                <div
                    className={`p-2.5 rounded-xl ${c.bg} ${c.border} border flex-shrink-0 ml-3`}
                >
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
            </div>
            {subtitle && (
                <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
            )}
        </div>
    );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ message = "Tidak ada data untuk periode ini" }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-base font-semibold text-slate-500">{message}</p>
        <p className="text-sm text-slate-400 mt-1">
            Coba ubah filter periode atau kategori
        </p>
    </div>
);

// ============================================================
// TAB 1: REKAP TRANSAKSI PERIODE
// ============================================================

const RekapTransaksi = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/laporan/rekap-transaksi", {
                params: { bulan, tahun },
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching rekap transaksi:", err);
            toast.error("Gagal memuat data rekap transaksi.");
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const downloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get(
                "/api/laporan/rekap-transaksi/pdf",
                {
                    responseType: "blob",
                    params: { bulan, tahun },
                },
            );
            const bulanLabel =
                MONTHS.find((m) => m.value === bulan)?.label || bulan;
            downloadBlob(
                response.data,
                `Rekap-Transaksi-${bulanLabel}-${tahun}.pdf`,
            );
            toast.success("Laporan berhasil diunduh.");
        } catch {
            toast.error(
                "Gagal mengunduh laporan. Pastikan ada data untuk periode ini.",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <LoadingSkeleton />;
    if (!data) return <EmptyState />;

    const filteredDetail = (data.detail || []).filter((d) => {
        const s = searchTerm.toLowerCase();
        return (
            d.barang.toLowerCase().includes(s) ||
            d.pengaju.toLowerCase().includes(s) ||
            d.jenis.toLowerCase().includes(s)
        );
    });

    const totalPages = Math.ceil(filteredDetail.length / perPage);
    const paginatedDetail = filteredDetail.slice(
        (page - 1) * perPage,
        page * perPage,
    );

    const chartData = data.chart_data || [];
    const simplifiedChart =
        chartData.length > 31
            ? chartData.filter(
                  (_, i) => i % Math.ceil(chartData.length / 31) === 0,
              )
            : chartData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PeriodFilter
                    bulan={bulan}
                    setBulan={setBulan}
                    tahun={tahun}
                    setTahun={setTahun}
                    onApply={fetchData}
                    onDownload={downloadPdf}
                    isDownloading={isDownloading}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Transaksi"
                    value={formatNumber(data.summary.total_transaksi)}
                    icon={Activity}
                    color="blue"
                    subtitle="Seluruh transaksi periode ini"
                />
                <SummaryCard
                    title="Penerimaan Bahan"
                    value={formatNumber(data.summary.total_masuk)}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Jumlah transaksi masuk"
                />
                <SummaryCard
                    title="Pengeluaran Bahan"
                    value={formatNumber(data.summary.total_keluar)}
                    icon={TrendingDown}
                    color="orange"
                    subtitle="Jumlah transaksi keluar"
                />
                <SummaryCard
                    title="Nilai Penerimaan"
                    value={formatCurrency(data.summary.nilai_masuk)}
                    icon={Package}
                    color="purple"
                    subtitle="Total nilai bahan diterima"
                />
            </div>

            {/* Chart */}
            {simplifiedChart.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-slate-800">
                            Tren Aktivitas Transaksi Harian
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Distribusi transaksi masuk dan keluar sepanjang
                            periode
                        </p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={simplifiedChart}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="tanggal"
                                    tickFormatter={(v) => {
                                        const d = new Date(v);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        fontSize: "13px",
                                    }}
                                    labelFormatter={(v) =>
                                        new Date(v).toLocaleDateString(
                                            "id-ID",
                                            {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            },
                                        )
                                    }
                                />
                                <Legend wrapperStyle={{ fontSize: "13px" }} />
                                <Bar
                                    dataKey="masuk"
                                    name="Masuk"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="keluar"
                                    name="Keluar"
                                    fill="#f59e0b"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">
                            Rincian Transaksi
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {filteredDetail.length} transaksi ditemukan
                        </p>
                    </div>
                    <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari barang / pengaju..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Tanggal</th>
                                <th className="px-5 py-3">Jenis</th>
                                <th className="px-5 py-3">Barang</th>
                                <th className="px-5 py-3">Jumlah</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Pengaju</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {paginatedDetail.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-5 py-12 text-center text-slate-400"
                                    >
                                        Tidak ada data transaksi
                                    </td>
                                </tr>
                            ) : (
                                paginatedDetail.map((d, i) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-slate-50/70 transition-colors"
                                    >
                                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap text-xs">
                                            {d.tanggal}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${d.jenis === "Masuk" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                            >
                                                {d.jenis}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-800">
                                            {d.barang}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {formatNumber(d.jumlah)}{" "}
                                            <span className="text-slate-400 text-xs">
                                                {d.satuan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {d.pengaju}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredDetail.length > perPage && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-700">
                                {(page - 1) * perPage + 1}
                            </span>
                            –
                            <span className="font-semibold text-slate-700">
                                {Math.min(
                                    page * perPage,
                                    filteredDetail.length,
                                )}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredDetail.length}
                            </span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), page + 2)
                                .map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === page ? "bg-[#0266a2] text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page === totalPages}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === totalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// TAB 2: TREN PERMINTAAN BAHAN
// ============================================================

const CHART_COLORS = [
    "#0266a2",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#f97316",
    "#6366f1",
];

const TrenPermintaan = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/laporan/barang-populer", {
                params: { bulan, tahun, limit: 10 },
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching barang populer:", err);
            toast.error("Gagal memuat data tren permintaan.");
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const downloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get(
                "/api/laporan/barang-populer/pdf",
                {
                    responseType: "blob",
                    params: { bulan, tahun, limit: 10 },
                },
            );
            const bulanLabel =
                MONTHS.find((m) => m.value === bulan)?.label || bulan;
            downloadBlob(
                response.data,
                `Tren-Permintaan-Bahan-${bulanLabel}-${tahun}.pdf`,
            );
            toast.success("Laporan berhasil diunduh.");
        } catch {
            toast.error(
                "Gagal mengunduh laporan. Pastikan ada data untuk periode ini.",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <LoadingSkeleton />;
    if (!data || data.data.length === 0)
        return (
            <div className="space-y-6">
                <PeriodFilter
                    bulan={bulan}
                    setBulan={setBulan}
                    tahun={tahun}
                    setTahun={setTahun}
                    onApply={fetchData}
                    onDownload={downloadPdf}
                    isDownloading={isDownloading}
                />
                <EmptyState message="Belum ada data permintaan bahan untuk periode ini" />
            </div>
        );

    return (
        <div className="space-y-6">
            <PeriodFilter
                bulan={bulan}
                setBulan={setBulan}
                tahun={tahun}
                setTahun={setTahun}
                onApply={fetchData}
                onDownload={downloadPdf}
                isDownloading={isDownloading}
            />

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="mb-5">
                    <h3 className="text-base font-semibold text-slate-800">
                        10 Bahan Paling Sering Diminta
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Diurutkan berdasarkan frekuensi permintaan pengeluaran
                    </p>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data.chart_data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#64748b", fontSize: 11 }}
                            />
                            <YAxis
                                dataKey="nama"
                                type="category"
                                width={130}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#334155", fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    fontSize: "13px",
                                }}
                                formatter={(value, name) => [
                                    formatNumber(value),
                                    name === "frekuensi"
                                        ? "Frekuensi Permintaan"
                                        : "Total Jumlah",
                                ]}
                            />
                            <Legend wrapperStyle={{ fontSize: "13px" }} />
                            <Bar
                                dataKey="frekuensi"
                                name="Frekuensi Permintaan"
                                radius={[0, 4, 4, 0]}
                            >
                                {data.chart_data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            CHART_COLORS[
                                                index % CHART_COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">
                        Tabel Peringkat Bahan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Bahan dengan permintaan tertinggi pada periode ini
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 w-12">#</th>
                                <th className="px-5 py-3">
                                    Nama Barang / Bahan
                                </th>
                                <th className="px-5 py-3">Kategori</th>
                                <th className="px-5 py-3 text-center">
                                    Frekuensi
                                </th>
                                <th className="px-5 py-3 text-right">
                                    Total Jumlah
                                </th>
                                <th className="px-5 py-3">Satuan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {data.data.map((item) => (
                                <tr
                                    key={item.barang_id}
                                    className="hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                                item.ranking === 1
                                                    ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                                                    : item.ranking <= 3
                                                      ? "bg-amber-50 text-amber-600"
                                                      : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {item.ranking}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                                        {item.nama_barang}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs">
                                            {item.kategori}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0266a2]">
                                            {item.frekuensi}x
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                                        {formatNumber(item.total_jumlah)}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                                        {item.satuan}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// TAB 3: ANALISIS EFISIENSI PEMAKAIAN
// ============================================================

const AnalisisEfisiensi = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/laporan/efisiensi", {
                params: { bulan, tahun },
            });
            setData(res.data);
        } catch (err) {
            console.error("Error fetching efisiensi:", err);
            toast.error("Gagal memuat data analisis efisiensi.");
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const downloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get("/api/laporan/efisiensi/pdf", {
                responseType: "blob",
                params: { bulan, tahun },
            });
            const bulanLabel =
                MONTHS.find((m) => m.value === bulan)?.label || bulan;
            downloadBlob(
                response.data,
                `Analisis-Efisiensi-${bulanLabel}-${tahun}.pdf`,
            );
            toast.success("Laporan berhasil diunduh.");
        } catch {
            toast.error(
                "Gagal mengunduh laporan. Pastikan ada data untuk periode ini.",
            );
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <LoadingSkeleton />;
    if (!data || data.data.length === 0)
        return (
            <div className="space-y-6">
                <PeriodFilter
                    bulan={bulan}
                    setBulan={setBulan}
                    tahun={tahun}
                    setTahun={setTahun}
                    onApply={fetchData}
                    onDownload={downloadPdf}
                    isDownloading={isDownloading}
                />
                <EmptyState message="Belum ada data rencana atau realisasi pemakaian untuk periode ini" />
            </div>
        );

    const getStatusStyle = (status) => {
        switch (status) {
            case "Hemat":
                return "bg-emerald-100 text-emerald-700";
            case "Sesuai":
                return "bg-blue-100 text-blue-700";
            case "Boros":
                return "bg-rose-100 text-rose-700";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    const getEfisiensiColor = (persen) => {
        if (persen <= 80) return "text-emerald-600 font-bold";
        if (persen <= 100) return "text-blue-600 font-bold";
        return "text-rose-600 font-bold";
    };

    const chartData = data.data.slice(0, 10).map((d) => ({
        nama:
            d.nama_barang.length > 14
                ? d.nama_barang.substring(0, 14) + "…"
                : d.nama_barang,
        Rencana: d.jumlah_rencana,
        Realisasi: d.jumlah_realisasi,
    }));

    return (
        <div className="space-y-6">
            <PeriodFilter
                bulan={bulan}
                setBulan={setBulan}
                tahun={tahun}
                setTahun={setTahun}
                onApply={fetchData}
                onDownload={downloadPdf}
                isDownloading={isDownloading}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Rata-rata Efisiensi"
                    value={`${data.summary.rata_rata_efisiensi}%`}
                    icon={Zap}
                    color={
                        data.summary.rata_rata_efisiensi <= 100
                            ? "green"
                            : "red"
                    }
                    subtitle={
                        data.summary.rata_rata_efisiensi <= 100
                            ? "Pemakaian terkendali"
                            : "Melebihi rencana"
                    }
                />
                <SummaryCard
                    title="Total Rencana"
                    value={formatNumber(data.summary.total_rencana)}
                    icon={FileText}
                    color="blue"
                    subtitle="Jumlah yang direncanakan"
                />
                <SummaryCard
                    title="Total Realisasi"
                    value={formatNumber(data.summary.total_realisasi)}
                    icon={Package}
                    color="orange"
                    subtitle="Jumlah aktual dipakai"
                />
                <SummaryCard
                    title="Jenis Bahan"
                    value={formatNumber(data.summary.total_barang)}
                    icon={Box}
                    color="purple"
                    subtitle="Jenis bahan yang dianalisis"
                />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
                {[
                    {
                        label: "Hemat",
                        desc: "Realisasi < Rencana",
                        style: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    },
                    {
                        label: "Sesuai",
                        desc: "Realisasi = Rencana",
                        style: "bg-blue-50 text-blue-700 border-blue-200",
                    },
                    {
                        label: "Boros",
                        desc: "Realisasi > Rencana",
                        style: "bg-rose-50 text-rose-700 border-rose-200",
                    },
                ].map((item) => (
                    <span
                        key={item.label}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${item.style}`}
                    >
                        <span className="font-bold">{item.label}:</span>{" "}
                        {item.desc}
                    </span>
                ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-5">
                        <h3 className="text-base font-semibold text-slate-800">
                            Perbandingan Rencana vs Realisasi
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            10 bahan teratas berdasarkan total jumlah rencana
                        </p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -10,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    dataKey="nama"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10 }}
                                    angle={-15}
                                    textAnchor="end"
                                    height={55}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        fontSize: "13px",
                                    }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ fontSize: "13px" }} />
                                <Bar
                                    dataKey="Rencana"
                                    fill="#0266a2"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="Realisasi"
                                    fill="#f59e0b"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">
                        Detail Efisiensi per Jenis Bahan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {data.data.length} jenis bahan dianalisis
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">
                                    Nama Barang / Bahan
                                </th>
                                <th className="px-5 py-3">Satuan</th>
                                <th className="px-5 py-3 text-right">
                                    Rencana
                                </th>
                                <th className="px-5 py-3 text-right">
                                    Realisasi
                                </th>
                                <th className="px-5 py-3 text-right">
                                    Selisih
                                </th>
                                <th className="px-5 py-3 text-center">
                                    Efisiensi
                                </th>
                                <th className="px-5 py-3 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {data.data.map((item, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-slate-50/70 transition-colors"
                                >
                                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                                        {item.nama_barang}
                                    </td>
                                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                                        {item.satuan}
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-slate-700">
                                        {formatNumber(item.jumlah_rencana)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-slate-700">
                                        {formatNumber(item.jumlah_realisasi)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span
                                            className={
                                                item.selisih > 0
                                                    ? "text-rose-600 font-semibold"
                                                    : "text-emerald-600 font-semibold"
                                            }
                                        >
                                            {item.selisih > 0 ? "+" : ""}
                                            {formatNumber(item.selisih)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span
                                            className={getEfisiensiColor(
                                                item.efisiensi_persen,
                                            )}
                                        >
                                            {item.efisiensi_persen}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// TAB 4: AUDIT STOK & INVENTARIS
// ============================================================

const AuditStok = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("semua");
    const [page, setPage] = useState(1);
    const perPage = 15;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/api/laporan/stok-audit");
            setData(res.data);
        } catch (err) {
            console.error("Error fetching stok audit:", err);
            toast.error("Gagal memuat data audit stok.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const downloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get("/api/laporan/stok-audit/pdf", {
                responseType: "blob",
            });
            const today = new Date().toISOString().slice(0, 10);
            downloadBlob(response.data, `Audit-Stok-${today}.pdf`);
            toast.success("Laporan berhasil diunduh.");
        } catch {
            toast.error("Gagal mengunduh laporan.");
        } finally {
            setIsDownloading(false);
        }
    };

    const toggleRow = (id) =>
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

    if (isLoading) return <LoadingSkeleton />;
    if (!data) return <EmptyState />;

    const filteredData = (data.data || []).filter((item) => {
        const matchSearch =
            item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter =
            filterStatus === "semua" ||
            (filterStatus === "menipis" && item.status_stok === "Menipis") ||
            (filterStatus === "habis" && item.status_stok === "Habis") ||
            (filterStatus === "aman" && item.status_stok === "Aman") ||
            (filterStatus === "kadaluarsa" && item.batch_kadaluarsa > 0);
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage,
    );

    const getStokBadge = (status) => {
        switch (status) {
            case "Aman":
                return "bg-emerald-100 text-emerald-700";
            case "Menipis":
                return "bg-amber-100 text-amber-700";
            case "Habis":
                return "bg-rose-100 text-rose-700";
            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setPage(1);
                            }}
                            className="border-none outline-none text-sm text-slate-700 bg-transparent cursor-pointer"
                        >
                            <option value="semua">Semua Status</option>
                            <option value="aman">Stok Aman</option>
                            <option value="menipis">Stok Menipis</option>
                            <option value="habis">Stok Habis</option>
                            <option value="kadaluarsa">Ada Kadaluarsa</option>
                        </select>
                    </div>
                    <button
                        onClick={downloadPdf}
                        disabled={isDownloading}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#0266a2]" />
                        ) : (
                            <Download className="w-4 h-4 text-[#0266a2]" />
                        )}
                        {isDownloading ? "Mengunduh..." : "Unduh PDF"}
                    </button>
                </div>
                <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kode / nama bahan..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Jenis Bahan"
                    value={formatNumber(data.summary.total_jenis_barang)}
                    icon={Package}
                    color="blue"
                    subtitle="Jenis bahan terdaftar"
                />
                <SummaryCard
                    title="Stok Menipis"
                    value={formatNumber(data.summary.total_stok_menipis)}
                    icon={AlertTriangle}
                    color="orange"
                    subtitle="Perlu segera diisi ulang"
                />
                <SummaryCard
                    title="Batch Kadaluarsa"
                    value={formatNumber(data.summary.total_kadaluarsa)}
                    icon={AlertTriangle}
                    color="red"
                    subtitle="Segera ditangani"
                />
                <SummaryCard
                    title="Nilai Inventaris"
                    value={formatCurrency(data.summary.total_nilai_inventaris)}
                    icon={TrendingUp}
                    color="green"
                    subtitle="Estimasi total nilai aset"
                />
            </div>

            {/* Alert banner if issues exist */}
            {(data.summary.total_stok_menipis > 0 ||
                data.summary.total_kadaluarsa > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            Perhatian Diperlukan
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            {data.summary.total_stok_menipis > 0 &&
                                `${data.summary.total_stok_menipis} jenis bahan memiliki stok menipis. `}
                            {data.summary.total_kadaluarsa > 0 &&
                                `${data.summary.total_kadaluarsa} batch bahan sudah melewati tanggal kadaluarsa.`}
                        </p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">
                        Daftar Stok Bahan Laboratorium
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Klik baris untuk melihat detail batch ·{" "}
                        {filteredData.length} dari {data.data.length} item
                        ditampilkan
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 w-8"></th>
                                <th className="px-5 py-3">Kode</th>
                                <th className="px-5 py-3">
                                    Nama Barang / Bahan
                                </th>
                                <th className="px-5 py-3">Kategori</th>
                                <th className="px-5 py-3 text-right">Stok</th>
                                <th className="px-5 py-3 text-right">Min</th>
                                <th className="px-5 py-3 text-center">
                                    Status
                                </th>
                                <th className="px-5 py-3">Lokasi</th>
                                <th className="px-5 py-3 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-5 py-12 text-center text-slate-400"
                                    >
                                        Tidak ada data barang
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <React.Fragment key={item.barang_id}>
                                        <tr
                                            className={`transition-colors cursor-pointer ${
                                                item.status_stok === "Habis"
                                                    ? "hover:bg-rose-50/40"
                                                    : item.status_stok ===
                                                        "Menipis"
                                                      ? "hover:bg-amber-50/40"
                                                      : "hover:bg-slate-50"
                                            }`}
                                            onClick={() =>
                                                toggleRow(item.barang_id)
                                            }
                                        >
                                            <td className="px-5 py-3.5">
                                                {item.jumlah_batch > 0 &&
                                                    (expandedRows[
                                                        item.barang_id
                                                    ] ? (
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                                    ))}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                                                {item.kode_barang}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-semibold text-slate-800">
                                                    {item.nama_barang}
                                                </div>
                                                {item.batch_kadaluarsa > 0 && (
                                                    <div className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {item.batch_kadaluarsa}{" "}
                                                        batch kadaluarsa
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600">
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                                                    {item.kategori}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                                                {formatNumber(item.total_stok)}{" "}
                                                <span className="text-slate-400 font-normal text-xs">
                                                    {item.satuan}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-slate-500">
                                                {formatNumber(
                                                    item.stok_minimum,
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStokBadge(item.status_stok)}`}
                                                >
                                                    {item.status_stok}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 text-xs">
                                                {item.lokasi}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-slate-700">
                                                {formatCurrency(
                                                    item.total_nilai,
                                                )}
                                            </td>
                                        </tr>
                                        {expandedRows[item.barang_id] &&
                                            item.batches &&
                                            item.batches.length > 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={9}
                                                        className="px-8 py-3 bg-slate-50/80 border-b border-slate-100"
                                                    >
                                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                                            Detail Batch (
                                                            {
                                                                item.batches
                                                                    .length
                                                            }{" "}
                                                            batch)
                                                        </div>
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="text-slate-400 uppercase tracking-wider">
                                                                <tr>
                                                                    <th className="px-3 py-2">
                                                                        Kode
                                                                        Batch
                                                                    </th>
                                                                    <th className="px-3 py-2 text-right">
                                                                        Sisa
                                                                        Stok
                                                                    </th>
                                                                    <th className="px-3 py-2">
                                                                        Kadaluarsa
                                                                    </th>
                                                                    <th className="px-3 py-2">
                                                                        Status
                                                                        Batch
                                                                    </th>
                                                                    <th className="px-3 py-2">
                                                                        Kondisi
                                                                    </th>
                                                                    <th className="px-3 py-2 text-right">
                                                                        Harga
                                                                        Satuan
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {item.batches.map(
                                                                    (batch) => (
                                                                        <tr
                                                                            key={
                                                                                batch.id
                                                                            }
                                                                            className={
                                                                                batch.is_expired
                                                                                    ? "bg-rose-50/60"
                                                                                    : ""
                                                                            }
                                                                        >
                                                                            <td className="px-3 py-2 font-mono text-slate-600">
                                                                                {batch.kode_batch ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right font-semibold text-slate-700">
                                                                                {formatNumber(
                                                                                    batch.stok_tersisa,
                                                                                )}
                                                                            </td>
                                                                            <td className="px-3 py-2">
                                                                                {batch.tgl_kadaluarsa ? (
                                                                                    <span
                                                                                        className={`flex items-center gap-1 ${batch.is_expired ? "text-rose-600 font-semibold" : "text-slate-600"}`}
                                                                                    >
                                                                                        {batch.is_expired && (
                                                                                            <AlertTriangle className="w-3 h-3" />
                                                                                        )}
                                                                                        {new Date(
                                                                                            batch.tgl_kadaluarsa,
                                                                                        ).toLocaleDateString(
                                                                                            "id-ID",
                                                                                        )}
                                                                                        {batch.is_expired && (
                                                                                            <span className="text-rose-500 font-bold ml-1">
                                                                                                Exp!
                                                                                            </span>
                                                                                        )}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-slate-400">
                                                                                        Tidak
                                                                                        ada
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-slate-600">
                                                                                {batch.status_batch ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-slate-600">
                                                                                {batch.kondisi ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-right text-slate-600">
                                                                                {formatCurrency(
                                                                                    batch.harga_satuan,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filteredData.length > perPage && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-700">
                                {(page - 1) * perPage + 1}
                            </span>
                            –
                            <span className="font-semibold text-slate-700">
                                {Math.min(page * perPage, filteredData.length)}
                            </span>{" "}
                            dari{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredData.length}
                            </span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), page + 2)
                                .map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === page ? "bg-[#0266a2] text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={page === totalPages}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === totalPages ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// MAIN LAPORAN COMPONENT
// ============================================================

const TABS = [
    {
        key: "rekap-transaksi",
        label: "Rekap Transaksi Periode",
        icon: BarChart3,
        description:
            "Ringkasan arus masuk & keluar bahan per bulan dengan grafik harian",
        color: "text-[#0266a2] bg-blue-50",
    },
    {
        key: "barang-populer",
        label: "Tren Permintaan Bahan",
        icon: TrendingUp,
        description:
            "Bahan laboratorium yang paling sering diminta laboran pada periode ini",
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        key: "efisiensi",
        label: "Analisis Efisiensi Pemakaian",
        icon: Zap,
        description:
            "Perbandingan pemakaian aktual vs rencana kegiatan laboratorium",
        color: "text-amber-600 bg-amber-50",
    },
    {
        key: "stok-audit",
        label: "Audit Stok & Inventaris",
        icon: ShieldCheck,
        description:
            "Kondisi, status stok, dan estimasi nilai inventaris bahan saat ini",
        color: "text-violet-600 bg-violet-50",
    },
];

const Laporan = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || "rekap-transaksi";
    const activeTabData = TABS.find((t) => t.key === activeTab) || TABS[0];

    const handleTabChange = (key) => navigate(`/laporan/${key}`);
    const ActiveTabIcon = activeTabData.icon;

    const renderTab = () => {
        switch (activeTab) {
            case "rekap-transaksi":
                return <RekapTransaksi />;
            case "barang-populer":
                return <TrenPermintaan />;
            case "efisiensi":
                return <AnalisisEfisiensi />;
            case "stok-audit":
                return <AuditStok />;
            default:
                return <RekapTransaksi />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0266a2]/10">
                    <BarChart3 className="w-6 h-6 text-[#0266a2]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Laporan
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Pantau performa inventaris, tren permintaan, dan
                        efisiensi pemakaian bahan laboratorium
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-100">
                    {TABS.map(({ key, label, icon: Icon, color }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`flex items-center gap-2.5 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                                activeTab === key
                                    ? "border-[#0266a2] text-[#0266a2] bg-blue-50/40"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-lg transition-colors ${activeTab === key ? color : "bg-slate-100 text-slate-400"}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
                <div className="px-5 py-2.5 bg-slate-50/50 flex items-center gap-2 border-b border-slate-100">
                    <ActiveTabIcon
                        className={`w-3.5 h-3.5 ${activeTabData.color.split(" ")[0]}`}
                    />
                    <span className="text-xs text-slate-500">
                        {activeTabData.description}
                    </span>
                </div>
            </div>

            {/* Active Tab Content */}
            {renderTab()}
        </div>
    );
};

export default Laporan;
