import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserCheck, Plus, Search, Edit, Trash2, X, AlertCircle, Eye } from 'lucide-react';
import axios from 'axios';

const Koordinator = () => {
    const [koordinators, setKoordinators] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: null, user_id: null, name: '', email: '', password: '', nomor_hp: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchKoordinators = async (currentPage = 1, searchQuery = '', currentPerPage = 10) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/koordinator', {
                params: { page: currentPage, search: searchQuery, per_page: currentPerPage },
                headers: { Authorization: `Bearer ${token}` }
            });
            setKoordinators(response.data.data || response.data);
            if (response.data.links) setPagination(response.data);
        } catch (error) {
            console.error('Failed to fetch koordinators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKoordinators(page, search, perPage);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, perPage]);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, user_id: null, name: '', email: '', password: '', nomor_hp: '' });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (koor) => {
        setModalMode('edit');
        setFormData({ 
            id: koor.id, 
            user_id: koor.user_id,
            name: koor.user?.name || '', 
            email: koor.user?.email || '', 
            password: '', 
            nomor_hp: koor.nomor_hp || '' 
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors({});
        
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (modalMode === 'add') {
                await axios.post('/api/koordinator', formData, { headers });
            } else {
                await axios.put(`/api/koordinator/${formData.id}`, formData, { headers });
            }
            
            setIsModalOpen(false);
            fetchKoordinators(page, search, perPage);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setFormErrors(error.response.data.errors);
            } else {
                toast.error('Terjadi kesalahan saat menyimpan data.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/koordinator/${itemToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchKoordinators(page, search, perPage);
        } catch (error) {
            toast.error('Gagal menghapus koordinator.');
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCheck className="w-7 h-7 text-[#0266a2]" />
                        Data Koordinator
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Angkat laboran menjadi koordinator.</p>
                </div>
                
                <button 
                    onClick={openAddModal}
                    className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Koordinator
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Tampilkan</span>
                        <select 
                            value={perPage} 
                            onChange={handlePerPageChange}
                            className="border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900 bg-white"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span>data</span>
                    </div>
                    <div className="relative w-full sm:w-64 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari koordinator..." 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                        />
                    </div>
                </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Nama Koordinator</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Email (Username)</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Nomor HP</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="py-12 text-center text-slate-500">Memuat data...</td></tr>
                        ) : koordinators.length === 0 ? (
                            <tr><td colSpan="4" className="py-12 text-center text-slate-500">Tidak ada data.</td></tr>
                        ) : (
                            koordinators.map((koor) => (
                                <tr key={koor.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{koor.user?.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{koor.user?.email}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{koor.nomor_hp || '-'}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button 
                                            onClick={() => { setItemToView(koor); setIsViewModalOpen(true); }}
                                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => openEditModal(koor)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => { setItemToDelete(koor); setIsDeleteModalOpen(true); }} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

                {/* Pagination */}
                {pagination && koordinators.length > 0 && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{pagination.from || 0}</span> hingga <span className="font-semibold text-slate-700">{pagination.to || 0}</span> dari total <span className="font-semibold text-slate-700">{pagination.total}</span> data
                        </p>
                        <div className="flex items-center gap-1">
                            {pagination.links.map((link, index) => {
                                let label = link.label.replace('&laquo; Previous', 'Prev').replace('Next &raquo;', 'Next');
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (link.url) {
                                                const url = new URL(link.url);
                                                setPage(url.searchParams.get('page'));
                                            }
                                        }}
                                        disabled={!link.url || link.active}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                            link.active 
                                            ? 'bg-[#0266a2] text-white font-medium' 
                                            : link.url 
                                                ? 'text-slate-600 hover:bg-slate-100'
                                                : 'text-slate-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {isViewModalOpen && itemToView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Detail Koordinator</h3>
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {itemToView.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{itemToView.user?.name}</h4>
                                    <p className="text-sm text-slate-500">{itemToView.user?.email}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor HP</p>
                                <p className="text-sm font-medium text-slate-800">{itemToView.nomor_hp || '-'}</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">{modalMode === 'add' ? 'Angkat Koordinator Baru' : 'Edit Koordinator'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            {Object.keys(formErrors).length > 0 && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-800">Gagal menyimpan data</h4>
                                        <ul className="text-xs text-rose-600 mt-1 list-disc list-inside">
                                            {Object.values(formErrors).map((error, idx) => (
                                                <li key={idx}>{error[0]}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap <span className="text-rose-500">*</span></label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-2 border rounded-xl text-sm ${formErrors.name ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {formErrors.name && <p className="mt-1 text-xs text-rose-500">{formErrors.name[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email (Username) <span className="text-rose-500">*</span></label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full px-4 py-2 border rounded-xl text-sm ${formErrors.email ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {formErrors.email && <p className="mt-1 text-xs text-rose-500">{formErrors.email[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password {modalMode === 'add' && <span className="text-rose-500">*</span>}</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full px-4 py-2 border rounded-xl text-sm ${formErrors.password ? 'border-rose-500' : 'border-slate-200'}`} placeholder={modalMode === 'edit' ? 'Kosongkan jika tidak ingin diubah' : ''} />
                                    {formErrors.password && <p className="mt-1 text-xs text-rose-500">{formErrors.password[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor HP</label>
                                    <input type="text" value={formData.nomor_hp} onChange={(e) => setFormData({...formData, nomor_hp: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-[#0266a2] text-white text-sm font-semibold rounded-xl disabled:opacity-70">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8" /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hentikan Koordinator?</h3>
                        <p className="text-sm text-slate-500 mb-6">Yakin ingin menghapus {itemToDelete?.user?.name}?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 bg-slate-100 rounded-xl text-sm font-semibold w-full">Batal</button>
                            <button onClick={confirmDelete} className="px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold w-full">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Koordinator;
