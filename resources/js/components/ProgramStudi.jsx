import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { GraduationCap, Plus, Pencil, Trash2, Search, XCircle } from 'lucide-react';
import axios from '../lib/axios';
import ConfirmModal from './ConfirmModal';

const ProgramStudi = () => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode: '', nama: '' });
    const [errors, setErrors] = useState({});
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' });

    const showConfirm = (title, message, onConfirm) => setConfirmModal({ isOpen: true, title, message, onConfirm, variant: 'danger' });
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/program-studi');
            setList(res.data.data || res.data);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const openModal = (item = null) => {
        setFormData(item ? { id: item.id, kode: item.kode || '', nama: item.nama } : { id: null, kode: '', nama: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) await axios.put(`/api/program-studi/${formData.id}`, formData);
            else await axios.post('/api/program-studi', formData);
            setIsModalOpen(false);
            fetchData();
            toast.success('Program studi disimpan.');
        } catch (err) {
            if (err.response?.data?.errors) setErrors(err.response.data.errors);
            else toast.error('Gagal menyimpan data.');
        }
    };

    const handleDelete = (id) => showConfirm('Hapus Program Studi', 'Yakin ingin menghapus program studi ini?', async () => {
        try { await axios.delete(`/api/program-studi/${id}`); fetchData(); toast.success('Berhasil dihapus.'); }
        catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
    });

    const filtered = list.filter(p => p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || (p.kode || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="w-7 h-7 text-[#0266a2]" />Program Studi</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data program studi untuk perencanaan praktikum.</p>
                </div>
                <button onClick={() => openModal()} className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"><Plus className="w-4 h-4" />Tambah</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Cari program studi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr><th className="px-6 py-4">Kode</th><th className="px-6 py-4">Nama Program Studi</th><th className="px-6 py-4 text-right">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500"><GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="font-medium text-slate-900">Belum ada data</p></td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{item.kode || '-'}</td>
                                    <td className="px-6 py-4 text-slate-700">{item.nama}</td>
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit' : 'Tambah'} Program Studi</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg"><XCircle className="w-5 h-5" /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kode (Opsional)</label>
                                        <input type="text" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} placeholder="Contoh: TK" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2] text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Program Studi</label>
                                        <input type="text" required value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: Teknik Kimia" className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.nama ? 'border-rose-500' : 'border-slate-200 focus:border-[#0266a2]'} rounded-xl text-sm focus:outline-none focus:ring-1 text-black`} />
                                        {errors.nama && <p className="mt-1 text-xs text-rose-500">{errors.nama[0]}</p>}
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                                        <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm">Simpan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirm} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} />
        </div>
    );
};

export default ProgramStudi;
