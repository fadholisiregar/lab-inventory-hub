import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, Plus, Pencil, Trash2, Search, XCircle, CheckCircle, AlertTriangle, Save, Send } from 'lucide-react';
import axios from '../lib/axios';
import ConfirmModal from './ConfirmModal';
import SearchableSelect from './SearchableSelect';

const emptyItem = { id: null, barang_id: '', jumlah_pengajuan: '' };
const emptyForm = { id: null, program_studi_id: '', mata_kuliah_id: '', modul_praktikum_id: '', status: 'Draft', items: [{ ...emptyItem }] };

const KebutuhanPraktikum = () => {
    const [list, setList] = useState([]);
    const [prodiList, setProdiList] = useState([]);
    const [matkulList, setMatkulList] = useState([]);
    const [modulList, setModulList] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' });

    const showConfirm = (title, message, onConfirm) => setConfirmModal({ isOpen: true, title, message, onConfirm, variant: 'danger' });
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchData();
        axios.get('/api/program-studi').then(r => setProdiList(r.data.data || r.data)).catch(() => {});
        axios.get('/api/mata-kuliah').then(r => setMatkulList(r.data.data || r.data)).catch(() => {});
        axios.get('/api/modul-praktikum').then(r => setModulList(r.data.data || r.data)).catch(() => {});
        axios.get('/api/barang').then(r => setBarangList(r.data.data || r.data)).catch(() => {});
    }, []);

    const fetchData = async () => {
        try { const res = await axios.get('/api/rencana-kebutuhan'); setList(res.data.data || res.data); }
        catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const matkulOptions = matkulList.filter(m => !formData.program_studi_id || String(m.program_studi_id) === String(formData.program_studi_id));
    const modulOptions = modulList.filter(m => !formData.mata_kuliah_id || String(m.mata_kuliah_id) === String(formData.mata_kuliah_id));

    const openModal = (item = null) => {
        if (item) {
            setFormData({
                id: item.id, program_studi_id: item.program_studi_id, mata_kuliah_id: item.mata_kuliah_id,
                modul_praktikum_id: item.modul_praktikum_id, status: item.status,
                items: (item.items || []).map(it => ({ id: it.id, barang_id: it.barang_id, jumlah_pengajuan: it.jumlah_pengajuan })),
            });
        } else {
            setFormData({ ...emptyForm, items: [{ ...emptyItem }] });
        }
        setIsModalOpen(true);
    };

    const setItem = (idx, field, value) => {
        const items = [...formData.items];
        items[idx][field] = value;
        setFormData({ ...formData, items });
    };
    const addRow = () => setFormData({ ...formData, items: [...formData.items, { ...emptyItem }] });
    const removeRow = (idx) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });

    const submit = async (status) => {
        if (isSubmitting) return;
        if (!formData.program_studi_id || !formData.mata_kuliah_id || !formData.modul_praktikum_id) {
            toast.error('Lengkapi Program Studi, Mata Kuliah, dan Modul.'); return;
        }
        const items = formData.items
            .filter(it => it.barang_id && it.jumlah_pengajuan)
            .map(it => ({ id: it.id, barang_id: it.barang_id, jumlah_pengajuan: it.jumlah_pengajuan }));
        if (status === 'Diajukan' && items.length === 0) { toast.error('Minimal 1 bahan harus diisi untuk diajukan.'); return; }

        setIsSubmitting(true);
        try {
            const payload = { ...formData, status, items };
            if (formData.id) await axios.put(`/api/rencana-kebutuhan/${formData.id}`, payload);
            else await axios.post('/api/rencana-kebutuhan', payload);
            setIsModalOpen(false);
            fetchData();
            toast.success(status === 'Draft' ? 'Disimpan sebagai draft.' : 'Rencana kebutuhan diajukan.');
        } catch (err) {
            const errs = err.response?.data?.errors;
            toast.error(errs ? Object.values(errs)[0][0] : (err.response?.data?.message || 'Gagal menyimpan.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => showConfirm('Hapus Rencana', 'Hapus rencana kebutuhan ini beserta seluruh itemnya?', async () => {
        try { await axios.delete(`/api/rencana-kebutuhan/${id}`); fetchData(); toast.success('Berhasil dihapus.'); }
        catch (err) { toast.error('Gagal menghapus.'); }
    });

    const docStatusBadge = (s) => {
        const map = { Draft: 'bg-slate-100 text-slate-600', Diajukan: 'bg-blue-100 text-blue-700', Selesai: 'bg-emerald-100 text-emerald-700' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-max ${map[s] || 'bg-slate-100 text-slate-700'}`}>{s}</span>;
    };

    const ringkasan = (items = []) => {
        const perlu = items.filter(i => i.status_item === 'Perlu Pengadaan').length;
        const cukup = items.length - perlu;
        return (
            <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><CheckCircle className="w-3 h-3" />{cukup} cukup</span>
                {perlu > 0 && <span className="inline-flex items-center gap-1 text-xs text-amber-700"><AlertTriangle className="w-3 h-3" />{perlu} perlu pengadaan</span>}
            </div>
        );
    };

    const filtered = list.filter(r => {
        const s = searchTerm.toLowerCase();
        return (r.program_studi?.nama || '').toLowerCase().includes(s)
            || (r.mata_kuliah?.nama || '').toLowerCase().includes(s)
            || (r.modul_praktikum?.nama || '').toLowerCase().includes(s);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="w-7 h-7 text-[#0266a2]" />Kebutuhan Bahan Praktikum</h1>
                    <p className="text-sm text-slate-500 mt-1">Rencanakan kebutuhan bahan per praktikum (1 dokumen = banyak bahan).</p>
                </div>
                <button onClick={() => openModal()} className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"><Plus className="w-4 h-4" />Buat Rencana</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari prodi / matkul / modul..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4">Prodi / Matkul / Modul</th>
                                <th className="px-4 py-4">Jumlah Bahan</th>
                                <th className="px-4 py-4">Ringkasan</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500"><ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-900">Belum ada rencana kebutuhan</p></td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 align-top">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{r.program_studi?.nama || '-'}</div>
                                        <div className="text-xs text-slate-500">{r.mata_kuliah?.nama || '-'} • {r.modul_praktikum?.nama || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{(r.items || []).length} bahan</td>
                                    <td className="px-4 py-3">{ringkasan(r.items)}</td>
                                    <td className="px-4 py-3">{docStatusBadge(r.status)}</td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <button onClick={() => openModal(r)} className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg" title="Edit / Detail"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                                    <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit' : 'Buat'} Rencana Kebutuhan</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><XCircle className="w-5 h-5" /></button>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Header */}
                                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Program Studi</label>
                                            <select value={formData.program_studi_id} onChange={(e) => setFormData({ ...formData, program_studi_id: e.target.value, mata_kuliah_id: '', modul_praktikum_id: '' })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">-- Pilih --</option>
                                                {prodiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Kuliah</label>
                                            <select value={formData.mata_kuliah_id} onChange={(e) => setFormData({ ...formData, mata_kuliah_id: e.target.value, modul_praktikum_id: '' })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">-- Pilih --</option>
                                                {matkulOptions.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Modul Praktikum</label>
                                            <select value={formData.modul_praktikum_id} onChange={(e) => setFormData({ ...formData, modul_praktikum_id: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">-- Pilih --</option>
                                                {modulOptions.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Detail items */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-slate-800 text-sm">Daftar Bahan</h4>
                                            <button type="button" onClick={addRow} className="text-xs font-semibold text-[#0266a2] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">+ Tambah Baris</button>
                                        </div>
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-3 py-2.5 text-left w-10">No</th>
                                                        <th className="px-3 py-2.5 text-left min-w-[240px]">Bahan</th>
                                                        <th className="px-3 py-2.5 text-left min-w-[120px]">Jumlah</th>
                                                        <th className="px-3 py-2.5 text-left min-w-[120px]">Ketersediaan</th>
                                                        <th className="px-3 py-2.5 text-left min-w-[140px]">Status</th>
                                                        <th className="px-3 py-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {formData.items.map((it, idx) => {
                                                        const b = barangList.find(x => String(x.id) === String(it.barang_id));
                                                        const stok = Number(b?.total_stok ?? 0);
                                                        const sat = b?.satuan?.singkatan || '';
                                                        const cukup = it.jumlah_pengajuan !== '' && stok >= Number(it.jumlah_pengajuan);
                                                        return (
                                                            <tr key={idx} className="align-top">
                                                                <td className="px-3 py-3 text-slate-500 font-medium">{idx + 1}</td>
                                                                <td className="px-3 py-3">
                                                                    <SearchableSelect value={it.barang_id} onChange={(e) => setItem(idx, 'barang_id', e.target.value)} options={barangList.map(x => ({ value: x.id, label: `${x.kode_barang} - ${x.nama_barang}` }))} placeholder="-- Pilih Bahan --" size="sm" className="w-full" />
                                                                </td>
                                                                <td className="px-3 py-3">
                                                                    <input type="number" min="0.001" step="any" value={it.jumlah_pengajuan} onChange={(e) => setItem(idx, 'jumlah_pengajuan', e.target.value)} className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
                                                                </td>
                                                                <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{b ? `${stok} ${sat}` : '—'}</td>
                                                                <td className="px-3 py-3">
                                                                    {b && it.jumlah_pengajuan !== '' ? (
                                                                        cukup
                                                                            ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Cukup</span>
                                                                            : <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Perlu Pengadaan</span>
                                                                    ) : <span className="text-xs text-slate-400">—</span>}
                                                                </td>
                                                                <td className="px-3 py-3 text-center">
                                                                    {formData.items.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="text-rose-400 hover:text-rose-600"><XCircle className="w-5 h-5" /></button>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[11px] text-slate-400">Status dihitung dari ketersediaan stok saat disimpan. Item "Perlu Pengadaan" akan muncul di menu Pengadaan Bahan Praktikum setelah diajukan.</p>
                                    </div>

                                    <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                                        <button type="button" disabled={isSubmitting} onClick={() => submit('Draft')} className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-amber-100 hover:bg-amber-200 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" />Simpan Draft</button>
                                        <button type="button" disabled={isSubmitting} onClick={() => submit('Diajukan')} className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"><Send className="w-4 h-4" />{isSubmitting ? 'Memproses...' : 'Ajukan'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirm} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} />
        </div>
    );
};

export default KebutuhanPraktikum;
