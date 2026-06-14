import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Shield, Plus, Search, Edit, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import Modal from './Modal';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ id: null, kode: '', name: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchRoles = async (currentPage = 1, searchQuery = '', currentPerPage = 10) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/roles', {
                params: { page: currentPage, search: searchQuery, per_page: currentPerPage },
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(response.data.data);
            setPagination(response.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRoles(page, search, perPage);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, perPage]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePerPageChange = (e) => {
        setPerPage(parseInt(e.target.value));
        setPage(1);
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, kode: '', name: '' });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (role) => {
        setModalMode('edit');
        setFormData({ id: role.id, kode: role.kode, name: role.name });
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
                await axios.post('/api/roles', formData, { headers });
            } else {
                await axios.put(`/api/roles/${formData.id}`, formData, { headers });
            }
            
            setIsModalOpen(false);
            fetchRoles(page, search, perPage);
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

    const openDeleteModal = (role) => {
        setItemToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/roles/${itemToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchRoles(page, search, perPage);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal menghapus role.');
            }
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="w-7 h-7 text-[#0266a2]" />
                        Manajemen Role
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data hak akses / peran sistem.</p>
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
                            placeholder="Cari role..." 
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                        />
                    </div>
                </div>



            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/50">
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Kode Role</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600">Nama Role</th>
                            <th className="py-4 px-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="3" className="py-12 text-center text-slate-500">Memuat data...</td>
                            </tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="py-12 text-center text-slate-500">Tidak ada data role ditemukan.</td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-800">{role.kode}</td>
                                    <td className="py-3 px-4 text-sm text-slate-700">{role.name}</td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button 
                                            onClick={() => openEditModal(role)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(role)}
                                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors inline-flex"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
                {/* Pagination */}
                {pagination && roles.length > 0 && (
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

            {/* Form Modal */}
            <Modal isOpen={isModalOpen} size="md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalMode === 'add' ? 'Tambah Role Baru' : 'Edit Role'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kode Role <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.kode}
                                        onChange={(e) => setFormData({...formData, kode: e.target.value})}
                                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                            formErrors.kode ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                        }`}
                                        placeholder="Contoh: ROL-01"
                                    />
                                    {formErrors.kode && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.kode[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Role <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                            formErrors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                        }`}
                                        placeholder="Contoh: Admin Gudang"
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-[#0266a2] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} size="sm">
                <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Role?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Apakah Anda yakin ingin menghapus role <span className="font-semibold text-slate-700">{itemToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors w-full"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm w-full"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                </div>
            </Modal>
        </div>
    );
};

export default Roles;
