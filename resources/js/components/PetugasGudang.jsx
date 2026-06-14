import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserCog, Plus, Search, Edit, Trash2, X, AlertCircle, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';
import Modal from './Modal';
import SearchableSelect from './SearchableSelect';

const PetugasGudang = () => {
    const [admins, setAdmins] = useState([]);
    const [laboranOptions, setLaboranOptions] = useState([]);
    const [rumpunOptions, setRumpunOptions] = useState([]);
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
    const [formData, setFormData] = useState({ id: null, laboran_id: '', kategori_rumpun_id: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchAdmins = async (currentPage = 1, searchQuery = '', currentPerPage = 10) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/petugas-gudang', {
                params: { page: currentPage, search: searchQuery, per_page: currentPerPage },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(response.data.data || response.data);
            if (response.data.links) setPagination(response.data);
        } catch (error) {
            console.error('Failed to fetch admin gudangs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLaborans = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/laboran?all=true', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLaboranOptions(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch laborans:', error);
        }
    };

    const fetchRumpuns = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/kategori-rumpun?all=true', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRumpunOptions(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch rumpuns:', error);
        }
    };

    useEffect(() => {
        fetchLaborans();
        fetchRumpuns();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAdmins(page, search, perPage);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, perPage]);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, laboran_id: '', kategori_rumpun_id: '' });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (admin) => {
        setModalMode('edit');
        setFormData({ 
            id: admin.id, 
            laboran_id: admin.laboran_id,
            kategori_rumpun_id: admin.kategori_rumpun_id || '' 
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
                await axios.post('/api/petugas-gudang', formData, { headers });
            } else {
                await axios.put(`/api/petugas-gudang/${formData.id}`, formData, { headers });
            }
            
            setIsModalOpen(false);
            fetchAdmins(page, search, perPage);
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
            await axios.delete(`/api/petugas-gudang/${itemToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchAdmins(page, search, perPage);
        } catch (error) {
            toast.error('Gagal menghapus petugas gudang.');
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCog className="w-7 h-7 text-[#0266a2]" />
                        Data Petugas Gudang
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola profil dan akun Petugas Gudang.</p>
                </div>
                
                <button 
                    onClick={openAddModal}
                    className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Data
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
                            placeholder="Cari petugas..." 
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
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Nama Lengkap</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Email</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Kategori Rumpun</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="4" className="py-12 text-center text-slate-500">Memuat data...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan="4" className="py-12 text-center text-slate-500">Tidak ada data.</td></tr>
                        ) : (
                            admins.map((admin) => (
                                <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{admin.laboran?.user?.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{admin.laboran?.user?.email}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{admin.kategori_rumpun?.nama_rumpun || '-'}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button 
                                            onClick={() => { setItemToView(admin); setIsViewModalOpen(true); }}
                                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                            title="Lihat Detail"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => openEditModal(admin)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => { setItemToDelete(admin); setIsDeleteModalOpen(true); }} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

                {/* Pagination */}
                {pagination && admins.length > 0 && (
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
            <Modal isOpen={isViewModalOpen && !!itemToView} size="md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Detail Petugas Gudang</h3>
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
                                    {itemToView?.laboran?.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{itemToView?.laboran?.user?.name}</h4>
                                    <p className="text-sm text-slate-500">{itemToView?.laboran?.user?.email}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kategori Rumpun</p>
                                <p className="text-sm font-medium text-slate-800 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
                                    {itemToView?.kategori_rumpun?.nama_rumpun || '-'}
                                </p>
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
            </Modal>

            <Modal isOpen={isModalOpen} size="md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">{modalMode === 'add' ? 'Tambah Petugas Gudang' : 'Edit Petugas Gudang'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-4">
                                {modalMode === 'add' ? (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pilih Laboran <span className="text-rose-500">*</span></label>
                                        <SearchableSelect
                                            value={formData.laboran_id}
                                            onChange={(e) => setFormData({...formData, laboran_id: e.target.value})}
                                            options={laboranOptions.map(lab => ({ value: lab.id, label: `${lab.user?.name} (${lab.user?.email})` }))}
                                            placeholder="-- Pilih Laboran --"
                                            error={!!formErrors.laboran_id}
                                        />
                                        {formErrors.laboran_id && <p className="mt-1 text-xs text-rose-500">{formErrors.laboran_id[0]}</p>}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Laboran</label>
                                        <div className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-black font-medium">
                                            {laboranOptions.find(l => l.id === formData.laboran_id)?.user?.name || '-'}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rumpun / Kategori</label>
                                    <SearchableSelect
                                        value={formData.kategori_rumpun_id}
                                        onChange={(e) => setFormData({...formData, kategori_rumpun_id: e.target.value})}
                                        options={rumpunOptions.map(r => ({ value: r.id, label: r.nama_rumpun }))}
                                        placeholder="-- Pilih Kategori Rumpun --"
                                        error={!!formErrors.kategori_rumpun_id}
                                    />
                                    {formErrors.kategori_rumpun_id && <p className="mt-1 text-xs text-rose-500">{formErrors.kategori_rumpun_id[0]}</p>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl">Batal</button>
                                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-[#0266a2] text-white text-sm font-semibold rounded-xl disabled:opacity-70 flex items-center gap-2">{isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan'}</button>
                            </div>
                        </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} size="sm">
                <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8" /></div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Petugas Gudang?</h3>
                        <p className="text-sm text-slate-500 mb-6">Yakin ingin memberhentikan {itemToDelete?.laboran?.user?.name} sebagai petugas gudang?</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 bg-slate-100 rounded-xl text-sm font-semibold w-full">Batal</button>
                            <button onClick={confirmDelete} className="px-5 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold w-full">Hapus</button>
                        </div>
                </div>
            </Modal>
        </div>
    );
};

export default PetugasGudang;
