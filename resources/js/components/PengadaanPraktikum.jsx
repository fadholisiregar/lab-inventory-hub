import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShoppingCart, Pencil, Search, XCircle } from 'lucide-react';
import axios from '../lib/axios';
import SearchableSelect from './SearchableSelect';

const STATUS_OPTS = ['Diajukan', 'Disetujui', 'Ditolak', 'Selesai'];
const fmtRupiah = (n) => (n === '' || n === null || n === undefined) ? '' : Number(String(n).replace(/[^\d]/g, '')).toLocaleString('id-ID');

const PengadaanPraktikum = () => {
    const [list, setList] = useState([]);
    const [penyediaList, setPenyediaList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({ harga_penawaran: '', penyedia_id: '', status_pengadaan: 'Diajukan' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
        axios.get('/api/penyedia').then(r => setPenyediaList(r.data.data || r.data)).catch(() => {});
    }, []);

    const fetchData = async () => {
        try { const res = await axios.get('/api/pengadaan-praktikum'); setList(res.data.data || res.data); }
        catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const openModal = (item) => {
        setSelected(item);
        setFormData({
            harga_penawaran: item.harga_penawaran ?? '',
            penyedia_id: item.penyedia_id || '',
            status_pengadaan: item.status_pengadaan || 'Diajukan',
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (isSaving) return;
        setIsSaving(true);
        try {
            await axios.put(`/api/pengadaan-praktikum/${selected.id}`, formData);
            setIsModalOpen(false);
            fetchData();
            toast.success('Pengadaan diperbarui.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan.');
        } finally {
            setIsSaving(false);
        }
    };

    const statusBadge = (s) => {
        const map = { Diajukan: 'bg-amber-100 text-amber-700', Disetujui: 'bg-blue-100 text-blue-700', Ditolak: 'bg-rose-100 text-rose-700', Selesai: 'bg-emerald-100 text-emerald-700' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-max ${map[s] || 'bg-slate-100 text-slate-500'}`}>{s || 'Belum diproses'}</span>;
    };

    const filtered = list.filter(p => {
        const s = searchTerm.toLowerCase();
        return (p.barang?.nama_barang || '').toLowerCase().includes(s)
            || (p.rencana?.mata_kuliah?.nama || '').toLowerCase().includes(s)
            || (p.penyedia?.nama_penyedia || '').toLowerCase().includes(s);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShoppingCart className="w-7 h-7 text-[#0266a2]" />Pengadaan Bahan Praktikum</h1>
                    <p className="text-sm text-slate-500 mt-1">Bahan dari Rencana Kebutuhan yang stoknya kurang. Lengkapi harga penawaran & penyedia.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari bahan / matkul / penyedia..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4">Prodi / Matkul / Modul</th>
                                <th className="px-4 py-4">Bahan</th>
                                <th className="px-4 py-4">Jumlah</th>
                                <th className="px-4 py-4">Stok</th>
                                <th className="px-4 py-4">Harga Penawaran</th>
                                <th className="px-4 py-4">Penyedia</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-500"><ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-900">Belum ada bahan yang perlu pengadaan</p><p className="text-xs text-slate-400 mt-1">Item muncul otomatis dari Rencana Kebutuhan yang diajukan & stoknya kurang.</p></td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 align-top">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{p.rencana?.program_studi?.nama || '-'}</div>
                                        <div className="text-xs text-slate-500">{p.rencana?.mata_kuliah?.nama || '-'} • {p.rencana?.modul_praktikum?.nama || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{p.barang?.nama_barang || '-'}</td>
                                    <td className="px-4 py-3 text-[#0266a2] font-semibold whitespace-nowrap">{p.jumlah_pengajuan} {p.barang?.satuan?.singkatan || ''}</td>
                                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{p.stok_saat_pengajuan ?? '-'} {p.barang?.satuan?.singkatan || ''}</td>
                                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{p.harga_penawaran ? `Rp ${Number(p.harga_penawaran).toLocaleString('id-ID')}` : '-'}</td>
                                    <td className="px-4 py-3 text-slate-600">{p.penyedia?.nama_penyedia || '-'}</td>
                                    <td className="px-4 py-3">{statusBadge(p.status_pengadaan)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openModal(p)} className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5" />Lengkapi</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selected && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800">Lengkapi Pengadaan</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><XCircle className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={handleSave} className="p-6 space-y-4">
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm">
                                        <div className="font-semibold text-slate-900">{selected.barang?.nama_barang}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{selected.rencana?.mata_kuliah?.nama} • {selected.rencana?.modul_praktikum?.nama}</div>
                                        <div className="text-xs text-slate-600 mt-1">Jumlah: <b>{selected.jumlah_pengajuan} {selected.barang?.satuan?.singkatan}</b> • Stok: {selected.stok_saat_pengajuan ?? '-'}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga Penawaran (Rp)</label>
                                        <input type="text" inputMode="numeric" value={fmtRupiah(formData.harga_penawaran)} onChange={(e) => setFormData({ ...formData, harga_penawaran: e.target.value.replace(/[^\d]/g, '') })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2] text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Penyedia / Vendor</label>
                                        <SearchableSelect value={formData.penyedia_id} onChange={(e) => setFormData({ ...formData, penyedia_id: e.target.value })} options={penyediaList.map(p => ({ value: p.id, label: `${p.kode_penyedia || '-'} - ${p.nama_penyedia}` }))} placeholder="-- Pilih Penyedia --" size="sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Pengadaan</label>
                                        <select value={formData.status_pengadaan} onChange={(e) => setFormData({ ...formData, status_pengadaan: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2] text-black">
                                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                                        <button type="submit" disabled={isSaving} className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-70">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PengadaanPraktikum;
