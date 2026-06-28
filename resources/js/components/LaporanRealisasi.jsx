import React, { useState, useEffect } from 'react';
import { BarChart3, Search, TrendingUp, Package, Target } from 'lucide-react';
import axios from '../lib/axios';

const todayStr = new Date().toISOString().slice(0, 10);
const yearStart = `${new Date().getFullYear()}-01-01`;

const LaporanRealisasi = () => {
    const [dari, setDari] = useState(yearStart);
    const [sampai, setSampai] = useState(todayStr);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/laporan/realisasi-perencanaan', { params: { dari, sampai } });
            setData(res.data.data || []);
            setSummary(res.data.summary || null);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fmt = (n) => Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

    const filtered = data.filter(d => (d.nama_barang || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.kode_barang || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const persenBadge = (p) => {
        if (p === null || p === undefined) return <span className="text-slate-400 text-xs">—</span>;
        const cls = p >= 90 ? 'bg-emerald-100 text-emerald-700' : p >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{p}%</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="w-7 h-7 text-[#0266a2]" />Laporan Realisasi Perencanaan</h1>
                <p className="text-sm text-slate-500 mt-1">Bandingkan jumlah yang direncanakan vs realisasi (barang keluar) per bahan.</p>
            </div>

            {/* Filter periode */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-end gap-3">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dari Tanggal</label>
                    <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
                    <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <button onClick={fetchData} className="px-4 py-2 bg-[#0266a2] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">Terapkan</button>
            </div>

            {/* Summary */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0266a2] flex items-center justify-center"><Package className="w-5 h-5" /></div>
                        <div><p className="text-xs text-slate-500">Jenis Barang</p><p className="text-lg font-bold text-slate-900">{summary.total_barang}</p></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Target className="w-5 h-5" /></div>
                        <div><p className="text-xs text-slate-500">Total Direncanakan</p><p className="text-lg font-bold text-slate-900">{fmt(summary.total_rencana)}</p></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                        <div><p className="text-xs text-slate-500">Total Realisasi</p><p className="text-lg font-bold text-slate-900">{fmt(summary.total_realisasi)}</p></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
                        <div><p className="text-xs text-slate-500">% Realisasi Total</p><p className="text-lg font-bold text-slate-900">{summary.persen_total !== null ? `${summary.persen_total}%` : '—'}</p></div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari barang..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4">Barang</th>
                                <th className="px-4 py-4 text-right">Direncanakan</th>
                                <th className="px-4 py-4 text-right">Realisasi (Keluar)</th>
                                <th className="px-4 py-4 text-right">Selisih</th>
                                <th className="px-4 py-4 text-center">% Realisasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500"><BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-900">Tidak ada data pada periode ini</p></td></tr>
                            ) : filtered.map(d => (
                                <tr key={d.barang_id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{d.nama_barang}</div>
                                        <div className="text-xs text-slate-400">{d.kode_barang}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">{fmt(d.direncanakan)} {d.satuan}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-[#0266a2] whitespace-nowrap">{fmt(d.realisasi)} {d.satuan}</td>
                                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${d.selisih < 0 ? 'text-rose-600' : 'text-slate-600'}`}>{fmt(d.selisih)} {d.satuan}</td>
                                    <td className="px-4 py-3 text-center">{persenBadge(d.persen)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-slate-400">Catatan: realisasi dihitung dari barang keluar (pengeluaran yang diproses) pada periode. Selisih negatif = pemakaian melebihi rencana.</p>
        </div>
    );
};

export default LaporanRealisasi;
