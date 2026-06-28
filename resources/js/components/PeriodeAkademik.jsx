import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CalendarRange, Plus, Pencil, Trash2, Search, XCircle, CheckCircle } from 'lucide-react';
import axios from '../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const emptyForm = { id: null, tahun_ajaran: '', semester: 'Ganjil', tanggal_mulai: '', tanggal_selesai: '', is_aktif: false };

const PeriodeAkademik = () => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [errors, setErrors] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' });

    const showConfirm = (title, message, onConfirm) => setConfirmModal({ isOpen: true, title, message, onConfirm, variant: 'danger' });
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try { const res = await axios.get('/api/periode-akademik'); setList(res.data.data || res.data); }
        catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const openModal = (item = null) => {
        setFormData(item ? {
            id: item.id, tahun_ajaran: item.tahun_ajaran, semester: item.semester,
            tanggal_mulai: item.tanggal_mulai || '', tanggal_selesai: item.tanggal_selesai || '', is_aktif: !!item.is_aktif,
        } : { ...emptyForm });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await axios.put(`/api/periode-akademik/${formData.id}`, formData);
            else await axios.post('/api/periode-akademik', formData);
            setIsModalOpen(false); fetchData(); toast.success('Periode akademik disimpan.');
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else toast.error(err.response?.data?.message || 'Gagal menyimpan data.');
        }
    };

    const handleDelete = (id) => showConfirm('Hapus Periode', 'Yakin ingin menghapus periode akademik ini?', async () => {
        try { await axios.delete(`/api/periode-akademik/${id}`); fetchData(); toast.success('Berhasil dihapus.'); }
        catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
    });

    const filtered = list.filter(p => (p.tahun_ajaran || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.semester || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CalendarRange className="w-7 h-7 text-[#0266a2]" />Periode Akademik</h1>
                    <p className="text-sm text-slate-500 mt-1">Tahun ajaran & semester untuk perencanaan (tandai satu sebagai aktif).</p>
                </div>
                <button onClick={() => openModal()} className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"><Plus className="w-4 h-4" />Tambah</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari tahun ajaran / semester..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr><th className="px-6 py-4">Tahun Ajaran</th><th className="px-6 py-4">Semester</th><th className="px-6 py-4">Rentang Tanggal</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500"><CalendarRange className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-900">Belum ada periode</p></td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{item.tahun_ajaran}</td>
                                    <td className="px-6 py-4 text-slate-700">{item.semester}</td>
                                    <td className="px-6 py-4 text-slate-600 text-xs">{item.tanggal_mulai || '-'} s/d {item.tanggal_selesai || '-'}</td>
                                    <td className="px-6 py-4">
                                        {item.is_aktif
                                            ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Aktif</span>
                                            : <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Nonaktif</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit' : 'Tambah'} Periode Akademik</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><XCircle className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tahun Ajaran</label>
                                            <input type="text" required value={formData.tahun_ajaran} onChange={(e) => setFormData({ ...formData, tahun_ajaran: e.target.value })} placeholder="2025/2026" className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.tahun_ajaran ? 'border-rose-500' : 'border-slate-200 focus:border-[#0266a2]'} rounded-xl text-sm focus:outline-none focus:ring-1 text-black`} />
                                            {errors.tahun_ajaran && <p className="mt-1 text-xs text-rose-500">{errors.tahun_ajaran[0]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Semester</label>
                                            <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] text-black">
                                                <option value="Ganjil">Ganjil</option>
                                                <option value="Genap">Genap</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Mulai</label>
                                            <input type="date" value={formData.tanggal_mulai} onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] text-black" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Selesai</label>
                                            <input type="date" value={formData.tanggal_selesai} onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })} className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.tanggal_selesai ? 'border-rose-500' : 'border-slate-200 focus:border-[#0266a2]'} rounded-xl text-sm focus:outline-none text-black`} />
                                            {errors.tanggal_selesai && <p className="mt-1 text-xs text-rose-500">{errors.tanggal_selesai[0]}</p>}
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2.5 px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-700 cursor-pointer hover:bg-slate-100">
                                        <input type="checkbox" checked={formData.is_aktif} onChange={(e) => setFormData({ ...formData, is_aktif: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-[#0266a2] focus:ring-[#0266a2]/20" />
                                        <span>Jadikan periode aktif (default saat membuat rencana)</span>
                                    </label>
                                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                                        <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm">Simpan</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
            </AnimatePresence>
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirm} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} />
        </div>
    );
};

export default PeriodeAkademik;
