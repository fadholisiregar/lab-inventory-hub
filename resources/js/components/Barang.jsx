import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Box, Plus, Search, Edit, Trash2, X, AlertCircle, Eye } from 'lucide-react';
import axios from '../lib/axios';

const Barang = () => {
    const [barangs, setBarangs] = useState([]);
    const [kategoriOptions, setKategoriOptions] = useState([]);
    const [satuanOptions, setSatuanOptions] = useState([]);
    const [lokasiOptions, setLokasiOptions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [itemToView, setItemToView] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ 
        id: null, kode_barang: '', nama_barang: '', kategori_id: '', 
        satuan_id: '', stok_minimum: 0, lokasi_id: '', spesifikasi: '', 
        sifat_bahan: '', perlu_kadaluarsa: false 
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchBarangs = async (currentPage = 1, searchQuery = '', currentPerPage = 10, category = 'Semua') => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/barang', {
                params: { page: currentPage, search: searchQuery, per_page: currentPerPage, kategori: category }
            });
            setBarangs(response.data.data);
            setPagination(response.data);
        } catch (error) {
            console.error('Failed to fetch barangs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchKategoris = async () => {
        try {
            const response = await axios.get('/api/kategori_barang?all=true');
            setKategoriOptions(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch kategori options', error);
        }
    };

    const fetchSatuans = async () => {
        try {
            const response = await axios.get('/api/satuan?all=true');
            setSatuanOptions(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch satuan options', error);
        }
    };

    const fetchLokasis = async () => {
        try {
            const response = await axios.get('/api/lokasi-penyimpanan');
            setLokasiOptions(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch lokasi options', error);
        }
    };

    useEffect(() => {
        fetchKategoris();
        fetchSatuans();
        fetchLokasis();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBarangs(page, search, perPage, filterKategori);
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, perPage, filterKategori]);

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
        setFormData({ 
            id: null, kode_barang: '', nama_barang: '', kategori_id: '', 
            satuan_id: '', stok_minimum: 0, lokasi_id: '', spesifikasi: '', 
            sifat_bahan: '', perlu_kadaluarsa: false 
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (brg) => {
        setModalMode('edit');
        setFormData({ 
            id: brg.id, 
            kode_barang: brg.kode_barang, 
            nama_barang: brg.nama_barang, 
            kategori_id: brg.kategori_id || '', 
            satuan_id: brg.satuan_id || '', 
            stok_minimum: brg.stok_minimum, 
            lokasi_id: brg.lokasi_id || '', 
            spesifikasi: brg.spesifikasi || '', 
            sifat_bahan: brg.sifat_bahan || '', 
            perlu_kadaluarsa: brg.perlu_kadaluarsa ? true : false
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors({});
        
        // Prepare payload, set empty strings to null for nullable foreign keys
        const payload = { ...formData };
        if (payload.kategori_id === '') payload.kategori_id = null;
        if (payload.satuan_id === '') payload.satuan_id = null;
        if (payload.lokasi_id === '') payload.lokasi_id = null;

        try {
            if (modalMode === 'add') {
                await axios.post('/api/barang', payload);
            } else {
                await axios.put(`/api/barang/${payload.id}`, payload);
            }
            setIsModalOpen(false);
            fetchBarangs(page, search, perPage);
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

    const openDeleteModal = (brg) => {
        setItemToDelete(brg);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`/api/barang/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchBarangs(page, search, perPage);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal menghapus barang.');
            }
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Box className="w-7 h-7 text-[#0266a2]" />
                        Referensi Barang
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data seluruh barang dan bahan di laboratorium.</p>
                </div>
                
                <button 
                    onClick={() => openAddModal()}
                    className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Barang
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                                placeholder="Cari kode atau nama barang..." 
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pb-2 sm:pb-0">
                        <select 
                            value={filterKategori}
                            onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] cursor-pointer min-w-[200px]"
                        >
                            <option value="Semua">Semua Kategori</option>
                            {kategoriOptions.map(cat => (
                                <option key={cat.id} value={cat.nama}>{cat.nama}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Kode</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Nama Barang</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Kategori</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Stok</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Satuan</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600">Lokasi</th>
                                <th className="py-4 px-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-500">Memuat data...</td>
                                </tr>
                            ) : barangs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-500">Tidak ada data barang ditemukan.</td>
                                </tr>
                            ) : (
                                barangs.map((brg) => (
                                    <tr key={brg.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{brg.kode_barang}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{brg.nama_barang}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{brg.kategori?.nama || '-'}</td>
                                        <td className="py-3 px-4 text-sm font-semibold text-[#0266a2]">
                                            {brg.total_stok || 0}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{brg.satuan?.simbol || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-500">{brg.lokasi?.nama || '-'}</td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button 
                                                onClick={() => { setItemToView(brg); setIsViewModalOpen(true); }}
                                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors inline-flex"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(brg)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(brg)}
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

                {/* Pagination Area */}
                {pagination && barangs.length > 0 && (
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Barang?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Apakah Anda yakin ingin menghapus barang <span className="font-semibold text-slate-700">{itemToDelete?.nama_barang}</span>? Tindakan ini tidak dapat dibatalkan.
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
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && itemToView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Detail Barang</h3>
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kode Barang</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.kode_barang}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nama Barang</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.nama_barang}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kategori</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.kategori?.nama || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Satuan</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.satuan?.nama_satuan || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stok Minimum</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.stok_minimum || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Lokasi Penyimpanan</p>
                                    <p className="text-sm font-medium text-slate-800">{itemToView.lokasi?.nama || '-'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Spesifikasi</p>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[60px]">
                                        {itemToView.spesifikasi || <span className="text-slate-400 italic">Tidak ada spesifikasi</span>}
                                    </p>
                                </div>
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

            {/* Form Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalMode === 'add' ? 'Tambah Barang Baru' : 'Edit Barang'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="barangForm" onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Left Column */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kode Barang <span className="text-rose-500">*</span></label>
                                            <input 
                                                type="text"
                                                value={formData.kode_barang}
                                                onChange={(e) => setFormData({...formData, kode_barang: e.target.value})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.kode_barang ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                                placeholder="Contoh: BRG-001"
                                            />
                                            {formErrors.kode_barang && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.kode_barang[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Barang <span className="text-rose-500">*</span></label>
                                            <input 
                                                type="text"
                                                value={formData.nama_barang}
                                                onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.nama_barang ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                                placeholder="Contoh: Tabung Reaksi"
                                            />
                                            {formErrors.nama_barang && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.nama_barang[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
                                            <select
                                                value={formData.kategori_id}
                                                onChange={(e) => setFormData({...formData, kategori_id: e.target.value})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.kategori_id ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            >
                                                <option value="">-- Pilih Kategori --</option>
                                                {kategoriOptions.map(kat => (
                                                    <option key={kat.id} value={kat.id}>{kat.nama}</option>
                                                ))}
                                            </select>
                                            {formErrors.kategori_id && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.kategori_id[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Satuan <span className="text-rose-500">*</span></label>
                                            <select
                                                value={formData.satuan_id}
                                                onChange={(e) => setFormData({...formData, satuan_id: e.target.value})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.satuan_id ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            >
                                                <option value="">-- Pilih Satuan --</option>
                                                {satuanOptions.map(sat => (
                                                    <option key={sat.id} value={sat.id}>{sat.nama_satuan} ({sat.simbol})</option>
                                                ))}
                                            </select>
                                            {formErrors.satuan_id && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.satuan_id[0]}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lokasi Penyimpanan</label>
                                            <select
                                                value={formData.lokasi_id}
                                                onChange={(e) => setFormData({...formData, lokasi_id: e.target.value})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.lokasi_id ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            >
                                                <option value="">-- Pilih Lokasi --</option>
                                                {lokasiOptions.map(lok => (
                                                    <option key={lok.id} value={lok.id}>{lok.kode} - {lok.nama}</option>
                                                ))}
                                            </select>
                                            {formErrors.lokasi_id && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.lokasi_id[0]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sifat Bahan</label>
                                            <input 
                                                type="text"
                                                value={formData.sifat_bahan}
                                                onChange={(e) => setFormData({...formData, sifat_bahan: e.target.value})}
                                                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors"
                                                placeholder="Contoh: Mudah Terbakar, Beracun"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stok Minimum</label>
                                            <input 
                                                type="number"
                                                min="0"
                                                value={formData.stok_minimum}
                                                onChange={(e) => setFormData({...formData, stok_minimum: parseInt(e.target.value) || 0})}
                                                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors ${
                                                    formErrors.stok_minimum ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            />
                                            {formErrors.stok_minimum && (
                                                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.stok_minimum[0]}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="pt-2 flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                id="perlu_kadaluarsa"
                                                checked={formData.perlu_kadaluarsa}
                                                onChange={(e) => setFormData({...formData, perlu_kadaluarsa: e.target.checked})}
                                                className="w-5 h-5 text-[#0266a2] bg-white border-slate-300 rounded focus:ring-[#0266a2] focus:ring-2 cursor-pointer"
                                            />
                                            <label htmlFor="perlu_kadaluarsa" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                                Barang memiliki tanggal kadaluarsa (Expired Date)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-5">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spesifikasi Detail</label>
                                    <textarea 
                                        value={formData.spesifikasi}
                                        onChange={(e) => setFormData({...formData, spesifikasi: e.target.value})}
                                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-colors"
                                        placeholder="Tambahkan spesifikasi lengkap barang..."
                                        rows="3"
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                form="barangForm"
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-[#0266a2] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Barang;
