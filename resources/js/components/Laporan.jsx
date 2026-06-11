import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BarChart3, Calendar, Download, Search, ChevronDown, ChevronRight,
    TrendingUp, TrendingDown, Package, AlertTriangle, CheckCircle2,
    FileText, ArrowUpDown, Filter, Printer, Box, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell, PieChart, Pie
} from 'recharts';
import axios from '../lib/axios';

// ============================================================
// SHARED UTILITIES
// ============================================================

const MONTHS = [
    { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
    { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' }, { value: 12, label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};

const formatCurrency = (num) => {
    if (num === null || num === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// ============================================================
// LOADING SKELETON
// ============================================================

const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-28">
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

const PeriodFilter = ({ bulan, setBulan, tahun, setTahun, onApply }) => (
    <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-700 bg-white"
            >
                {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                ))}
            </select>
            <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-700 bg-white"
            >
                {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
        <button
            onClick={onApply}
            className="px-4 py-2 bg-[#0266a2] text-white rounded-xl text-sm font-medium hover:bg-[#015a8c] transition-colors shadow-sm"
        >
            Terapkan
        </button>
        <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
            <Printer className="w-4 h-4" />
            Cetak
        </button>
    </div>
);

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
    const colorMap = {
        blue: 'bg-blue-50 text-[#0266a2]',
        green: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-amber-50 text-amber-600',
        red: 'bg-rose-50 text-rose-600',
        purple: 'bg-violet-50 text-violet-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
        </div>
    );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ message = 'Tidak ada data untuk periode ini' }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <FileText className="w-16 h-16 mb-4 text-slate-200" />
        <p className="text-base font-medium text-slate-500">{message}</p>
        <p className="text-sm text-slate-400 mt-1">Coba ubah filter periode atau kategori</p>
    </div>
);

// ============================================================
// TAB 1: REKAP TRANSAKSI
// ============================================================

const RekapTransaksi = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/laporan/rekap-transaksi', {
                params: { bulan, tahun }
            });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching rekap transaksi:', err);
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (isLoading) return <LoadingSkeleton />;
    if (!data) return <EmptyState />;

    const filteredDetail = (data.detail || []).filter(d => {
        const s = searchTerm.toLowerCase();
        return d.barang.toLowerCase().includes(s) || d.pengaju.toLowerCase().includes(s) || d.jenis.toLowerCase().includes(s);
    });

    const totalPages = Math.ceil(filteredDetail.length / perPage);
    const paginatedDetail = filteredDetail.slice((page - 1) * perPage, page * perPage);

    // Simplify chart data for display - group by date, show max ~15 points
    const chartData = data.chart_data || [];
    const simplifiedChart = chartData.length > 31
        ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 31) === 0)
        : chartData;

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <PeriodFilter bulan={bulan} setBulan={setBulan} tahun={tahun} setTahun={setTahun} onApply={fetchData} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Transaksi" value={formatNumber(data.summary.total_transaksi)} icon={Activity} color="blue" />
                <SummaryCard title="Barang Masuk" value={formatNumber(data.summary.total_masuk)} icon={TrendingUp} color="green" />
                <SummaryCard title="Barang Keluar" value={formatNumber(data.summary.total_keluar)} icon={TrendingDown} color="orange" />
                <SummaryCard title="Nilai Masuk" value={formatCurrency(data.summary.nilai_masuk)} icon={Package} color="purple" subtitle="Total nilai penerimaan" />
            </div>

            {/* Chart */}
            {simplifiedChart.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Tren Transaksi Harian</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={simplifiedChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="tanggal"
                                    tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth()+1}`; }}
                                    axisLine={false} tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                                    labelFormatter={(v) => new Date(v).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Legend wrapperStyle={{ fontSize: '13px' }} />
                                <Bar dataKey="masuk" name="Masuk" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="keluar" name="Keluar" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800">Detail Transaksi</h3>
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari barang / pengaju..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">Tidak ada data transaksi</td></tr>
                            ) : (
                                paginatedDetail.map((d) => (
                                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{d.tanggal}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${d.jenis === 'Masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {d.jenis}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-medium text-slate-800">{d.barang}</td>
                                        <td className="px-5 py-3 text-slate-700">{formatNumber(d.jumlah)} {d.satuan}</td>
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{d.status}</span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">{d.pengaju}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {filteredDetail.length > perPage && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{(page - 1) * perPage + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(page * perPage, filteredDetail.length)}</span> dari <span className="font-semibold text-slate-700">{filteredDetail.length}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === page ? 'bg-[#0266a2] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// TAB 2: BARANG POPULER
// ============================================================

const CHART_COLORS = ['#0266a2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

const BarangPopuler = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/laporan/barang-populer', {
                params: { bulan, tahun, limit: 10 }
            });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching barang populer:', err);
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (isLoading) return <LoadingSkeleton />;
    if (!data || data.data.length === 0) return (
        <div className="space-y-6">
            <PeriodFilter bulan={bulan} setBulan={setBulan} tahun={tahun} setTahun={setTahun} onApply={fetchData} />
            <EmptyState message="Belum ada data barang keluar untuk periode ini" />
        </div>
    );

    return (
        <div className="space-y-6 print:space-y-4">
            <div className="print:hidden">
                <PeriodFilter bulan={bulan} setBulan={setBulan} tahun={tahun} setTahun={setTahun} onApply={fetchData} />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Top 10 Barang Paling Sering Diminta</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chart_data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis
                                dataKey="nama"
                                type="category"
                                width={120}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#334155', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                                formatter={(value, name) => [formatNumber(value), name === 'frekuensi' ? 'Frekuensi' : 'Total Jumlah']}
                            />
                            <Legend wrapperStyle={{ fontSize: '13px' }} />
                            <Bar dataKey="frekuensi" name="Frekuensi Permintaan" radius={[0, 4, 4, 0]}>
                                {data.chart_data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">Ranking Barang</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">#</th>
                                <th className="px-5 py-3">Nama Barang</th>
                                <th className="px-5 py-3">Kategori</th>
                                <th className="px-5 py-3">Frekuensi</th>
                                <th className="px-5 py-3">Total Jumlah</th>
                                <th className="px-5 py-3">Satuan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {data.data.map((item) => (
                                <tr key={item.barang_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                            item.ranking <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {item.ranking}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{item.nama_barang}</td>
                                    <td className="px-5 py-3 text-slate-600">{item.kategori}</td>
                                    <td className="px-5 py-3">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0266a2]">{item.frekuensi}x</span>
                                    </td>
                                    <td className="px-5 py-3 font-semibold text-slate-800">{formatNumber(item.total_jumlah)}</td>
                                    <td className="px-5 py-3 text-slate-500">{item.satuan}</td>
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
// TAB 3: EFISIENSI PEMAKAIAN VS RENCANA
// ============================================================

const EfisiensiPemakaian = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bulan, setBulan] = useState(new Date().getMonth() + 1);
    const [tahun, setTahun] = useState(currentYear);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/laporan/efisiensi', {
                params: { bulan, tahun }
            });
            setData(res.data);
        } catch (err) {
            console.error('Error fetching efisiensi:', err);
        } finally {
            setIsLoading(false);
        }
    }, [bulan, tahun]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (isLoading) return <LoadingSkeleton />;
    if (!data || data.data.length === 0) return (
        <div className="space-y-6">
            <PeriodFilter bulan={bulan} setBulan={setBulan} tahun={tahun} setTahun={setTahun} onApply={fetchData} />
            <EmptyState message="Belum ada data rencana atau realisasi untuk periode ini" />
        </div>
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Hemat': return 'bg-emerald-100 text-emerald-700';
            case 'Sesuai': return 'bg-blue-100 text-blue-700';
            case 'Boros': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getEfisiensiColor = (persen) => {
        if (persen <= 80) return 'text-emerald-600';
        if (persen <= 100) return 'text-blue-600';
        return 'text-rose-600';
    };

    // Chart data - top items
    const chartData = data.data.slice(0, 10).map(d => ({
        nama: d.nama_barang.length > 15 ? d.nama_barang.substring(0, 15) + '...' : d.nama_barang,
        Rencana: d.jumlah_rencana,
        Realisasi: d.jumlah_realisasi,
    }));

    return (
        <div className="space-y-6 print:space-y-4">
            <div className="print:hidden">
                <PeriodFilter bulan={bulan} setBulan={setBulan} tahun={tahun} setTahun={setTahun} onApply={fetchData} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Rata-rata Efisiensi"
                    value={`${data.summary.rata_rata_efisiensi}%`}
                    icon={Activity}
                    color={data.summary.rata_rata_efisiensi <= 100 ? 'green' : 'red'}
                />
                <SummaryCard title="Total Rencana" value={formatNumber(data.summary.total_rencana)} icon={FileText} color="blue" />
                <SummaryCard title="Total Realisasi" value={formatNumber(data.summary.total_realisasi)} icon={Package} color="orange" />
                <SummaryCard title="Jumlah Barang" value={formatNumber(data.summary.total_barang)} icon={Box} color="purple" />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Perbandingan Rencana vs Realisasi</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
                                    formatter={(value) => formatNumber(value)}
                                />
                                <Legend wrapperStyle={{ fontSize: '13px' }} />
                                <Bar dataKey="Rencana" fill="#0266a2" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Realisasi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">Detail Efisiensi per Barang</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Nama Barang</th>
                                <th className="px-5 py-3">Satuan</th>
                                <th className="px-5 py-3 text-right">Rencana</th>
                                <th className="px-5 py-3 text-right">Realisasi</th>
                                <th className="px-5 py-3 text-right">Selisih</th>
                                <th className="px-5 py-3 text-center">Efisiensi</th>
                                <th className="px-5 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {data.data.map((item) => (
                                <tr key={item.barang_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-800">{item.nama_barang}</td>
                                    <td className="px-5 py-3 text-slate-500">{item.satuan}</td>
                                    <td className="px-5 py-3 text-right text-slate-700">{formatNumber(item.jumlah_rencana)}</td>
                                    <td className="px-5 py-3 text-right text-slate-700">{formatNumber(item.jumlah_realisasi)}</td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={item.selisih > 0 ? 'text-rose-600 font-medium' : 'text-emerald-600 font-medium'}>
                                            {item.selisih > 0 ? '+' : ''}{formatNumber(item.selisih)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`font-bold ${getEfisiensiColor(item.efisiensi_persen)}`}>
                                            {item.efisiensi_persen}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>
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
// TAB 4: LAPORAN STOK AUDIT
// ============================================================

const StokAudit = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('semua');
    const [page, setPage] = useState(1);
    const perPage = 15;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/laporan/stok-audit');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching stok audit:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (isLoading) return <LoadingSkeleton />;
    if (!data) return <EmptyState />;

    const filteredData = (data.data || []).filter(item => {
        const matchSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterStatus === 'semua' ||
            (filterStatus === 'menipis' && item.status_stok === 'Menipis') ||
            (filterStatus === 'habis' && item.status_stok === 'Habis') ||
            (filterStatus === 'aman' && item.status_stok === 'Aman') ||
            (filterStatus === 'kadaluarsa' && item.batch_kadaluarsa > 0);
        return matchSearch && matchFilter;
    });

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

    const getStokBadge = (status) => {
        switch(status) {
            case 'Aman': return 'bg-emerald-100 text-emerald-700';
            case 'Menipis': return 'bg-amber-100 text-amber-700';
            case 'Habis': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Print & Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-700 bg-white"
                        >
                            <option value="semua">Semua Status</option>
                            <option value="aman">Aman</option>
                            <option value="menipis">Menipis</option>
                            <option value="habis">Habis</option>
                            <option value="kadaluarsa">Ada Kadaluarsa</option>
                        </select>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Cetak
                    </button>
                </div>
                <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari kode / nama barang..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Jenis Barang" value={formatNumber(data.summary.total_jenis_barang)} icon={Package} color="blue" />
                <SummaryCard title="Stok Menipis" value={formatNumber(data.summary.total_stok_menipis)} icon={AlertTriangle} color="orange" />
                <SummaryCard title="Batch Kadaluarsa" value={formatNumber(data.summary.total_kadaluarsa)} icon={AlertTriangle} color="red" />
                <SummaryCard title="Nilai Inventaris" value={formatCurrency(data.summary.total_nilai_inventaris)} icon={TrendingUp} color="green" subtitle="Estimasi total nilai aset" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h3 className="text-base font-semibold text-slate-800">Data Stok Barang</h3>
                    <p className="text-xs text-slate-400 mt-1">Klik baris untuk melihat detail batch</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 w-8"></th>
                                <th className="px-5 py-3">Kode</th>
                                <th className="px-5 py-3">Nama Barang</th>
                                <th className="px-5 py-3">Kategori</th>
                                <th className="px-5 py-3 text-right">Stok</th>
                                <th className="px-5 py-3 text-right">Min</th>
                                <th className="px-5 py-3 text-center">Status</th>
                                <th className="px-5 py-3">Lokasi</th>
                                <th className="px-5 py-3 text-right">Nilai</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {paginatedData.length === 0 ? (
                                <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-400">Tidak ada data barang</td></tr>
                            ) : (
                                paginatedData.map((item) => (
                                    <React.Fragment key={item.barang_id}>
                                        <tr
                                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            onClick={() => toggleRow(item.barang_id)}
                                        >
                                            <td className="px-5 py-3">
                                                {item.jumlah_batch > 0 && (
                                                    expandedRows[item.barang_id]
                                                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                                                        : <ChevronRight className="w-4 h-4 text-slate-400" />
                                                )}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.kode_barang}</td>
                                            <td className="px-5 py-3 font-medium text-slate-800">{item.nama_barang}</td>
                                            <td className="px-5 py-3 text-slate-600">{item.kategori}</td>
                                            <td className="px-5 py-3 text-right font-semibold text-slate-800">{formatNumber(item.total_stok)} <span className="text-slate-400 font-normal text-xs">{item.satuan}</span></td>
                                            <td className="px-5 py-3 text-right text-slate-500">{formatNumber(item.stok_minimum)}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStokBadge(item.status_stok)}`}>
                                                    {item.status_stok}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">{item.lokasi}</td>
                                            <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(item.total_nilai)}</td>
                                        </tr>
                                        {/* Expanded batch detail */}
                                        {expandedRows[item.barang_id] && item.batches && item.batches.length > 0 && (
                                            <tr>
                                                <td colSpan={9} className="px-8 py-3 bg-slate-50/70">
                                                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Detail Batch ({item.batches.length})</div>
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="text-slate-400 uppercase">
                                                            <tr>
                                                                <th className="px-3 py-2">Kode Batch</th>
                                                                <th className="px-3 py-2 text-right">Sisa</th>
                                                                <th className="px-3 py-2">Kadaluarsa</th>
                                                                <th className="px-3 py-2">Status</th>
                                                                <th className="px-3 py-2">Kondisi</th>
                                                                <th className="px-3 py-2 text-right">Harga Satuan</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {item.batches.map((batch) => (
                                                                <tr key={batch.id} className={batch.is_expired ? 'bg-rose-50/50' : ''}>
                                                                    <td className="px-3 py-2 font-mono text-slate-600">{batch.kode_batch || '-'}</td>
                                                                    <td className="px-3 py-2 text-right font-semibold text-slate-700">{formatNumber(batch.stok_tersisa)}</td>
                                                                    <td className="px-3 py-2">
                                                                        {batch.tgl_kadaluarsa ? (
                                                                            <span className={batch.is_expired ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                                                                                {new Date(batch.tgl_kadaluarsa).toLocaleDateString('id-ID')}
                                                                                {batch.is_expired && ' ⚠️'}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-slate-600">{batch.status_batch || '-'}</td>
                                                                    <td className="px-3 py-2 text-slate-600">{batch.kondisi || '-'}</td>
                                                                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(batch.harga_satuan)}</td>
                                                                </tr>
                                                            ))}
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
                {/* Pagination */}
                {filteredData.length > perPage && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{(page - 1) * perPage + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(page * perPage, filteredData.length)}</span> dari <span className="font-semibold text-slate-700">{filteredData.length}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === page ? 'bg-[#0266a2] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}>Next</button>
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
    { key: 'rekap-transaksi', label: 'Rekap Transaksi', icon: BarChart3 },
    { key: 'barang-populer', label: 'Barang Populer', icon: TrendingUp },
    { key: 'efisiensi', label: 'Efisiensi Pemakaian', icon: Activity },
    { key: 'stok-audit', label: 'Stok Audit', icon: Package },
];

const Laporan = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'rekap-transaksi';

    const handleTabChange = (key) => {
        navigate(`/laporan/${key}`);
    };

    const renderTab = () => {
        switch(activeTab) {
            case 'rekap-transaksi': return <RekapTransaksi />;
            case 'barang-populer': return <BarangPopuler />;
            case 'efisiensi': return <EfisiensiPemakaian />;
            case 'stok-audit': return <StokAudit />;
            default: return <RekapTransaksi />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="print:hidden">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-7 h-7 text-[#0266a2]" />
                    Laporan
                </h1>
                <p className="text-sm text-slate-500 mt-1">Analisis dan laporan data inventaris laboratorium</p>
            </div>

            {/* Print Header */}
            <div className="hidden print:block">
                <h1 className="text-xl font-bold text-slate-900">Laporan — {TABS.find(t => t.key === activeTab)?.label}</h1>
                <p className="text-sm text-slate-500">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1 print:hidden">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === key
                                ? 'bg-[#0266a2] text-white shadow-md shadow-blue-900/10'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            {renderTab()}
        </div>
    );
};

export default Laporan;
