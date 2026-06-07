import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const StatusTransaksi = () => {
    const [statusList, setStatusList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterKategori, setFilterKategori] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPerPage, setCurrentPerPage] = useState(10);
    const [totalData, setTotalData] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({ kategori: 'Masuk', kode: '', nama: '', keterangan: '' });
    const [formErrors, setFormErrors] = useState({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        fetchStatus(currentPage, searchQuery, currentPerPage);
    }, [currentPage, currentPerPage]);

    const fetchStatus = async (page = 1, search = '', perPage = 10) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/status-transaksi', {
                params: { page, search, per_page: perPage, kategori: filterKategori },
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusList(response.data.data);
            setTotalPages(response.data.last_page);
            setCurrentPage(response.data.current_page);
            setTotalData(response.data.total);
        } catch (error) {
            console.error('Error fetching status data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchStatus(1, searchQuery, currentPerPage);
    };

    const handleFilterKategori = (e) => {
        setFilterKategori(e.target.value);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchStatus(1, searchQuery, currentPerPage);
    }, [filterKategori]);

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setFormErrors({});
        if (mode === 'add') {
            setFormData({ kategori: 'Masuk', kode: '', nama: '', keterangan: '' });
        } else if (mode === 'edit' && item) {
            setFormData({ ...item });
        }
        setIsModalOpen(true);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.kode.trim()) errors.kode = 'Kode harus diisi';
        if (!formData.nama.trim()) errors.nama = 'Nama harus diisi';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (modalMode === 'add') {
                await axios.post('/api/status-transaksi', formData, { headers });
            } else {
                await axios.put(`/api/status-transaksi/${formData.id}`, formData, { headers });
            }
            
            setIsModalOpen(false);
            fetchStatus(currentPage, searchQuery, currentPerPage);
        } catch (error) {
            console.error('Error saving data:', error);
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
            }
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/status-transaksi/${itemToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsDeleteModalOpen(false);
            fetchStatus(currentPage, searchQuery, currentPerPage);
        } catch (error) {
            console.error('Error deleting data:', error);
            toast.error('Gagal menghapus status. Pastikan status ini tidak sedang digunakan.');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Referensi Status Transaksi
                </h1>
                <p className="text-gray-600 mt-1">Kelola data status untuk pelacakan transaksi barang.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <span className="text-sm text-gray-500">Tampilkan</span>
                        <select 
                            className="border border-gray-300 rounded-md text-sm p-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={currentPerPage}
                            onChange={(e) => {
                                setCurrentPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                        <span className="text-sm text-gray-500">data</span>
                    </div>

                    <div className="flex w-full md:w-auto space-x-3">
                        <form onSubmit={handleSearch} className="relative w-full md:w-64">
                            <input 
                                type="text" 
                                placeholder="Cari status..." 
                                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            {searchQuery && (
                                <button type="button" onClick={() => { setSearchQuery(''); setCurrentPage(1); fetchStatus(1, '', currentPerPage); }} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none" title="Clear search">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </form>
                        <div className="relative flex items-center">
                            <select 
                                className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white appearance-none pr-10"
                                value={filterKategori}
                                onChange={handleFilterKategori}
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Masuk">Barang Masuk</option>
                                <option value="Keluar">Barang Keluar</option>
                            </select>
                            <div className="absolute right-3 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                            {filterKategori && (
                                <button type="button" onClick={() => setFilterKategori('')} className="absolute right-8 text-gray-400 hover:text-gray-600 focus:outline-none bg-white px-1" title="Clear filter">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => openModal('add')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center whitespace-nowrap shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Tambah Baru
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : statusList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                            <p className="text-gray-500 font-medium">Tidak ada data ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                statusList.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {(currentPage - 1) * currentPerPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.kategori === 'Masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.kode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.nama}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {item.keterangan || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => openModal('edit', item)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(item)}
                                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!isLoading && statusList.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            Menampilkan {(currentPage - 1) * currentPerPage + 1} hingga {Math.min(currentPage * currentPerPage, totalData)} dari {totalData} data
                        </span>
                        <div className="flex space-x-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Sebelumnya
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                                <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                    {modalMode === 'add' ? 'Tambah Status Baru' : 'Edit Status'}
                                </h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                                        <select
                                            id="kategori"
                                            className="w-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                                            value={formData.kategori}
                                            onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                                        >
                                            <option value="Masuk">Barang Masuk</option>
                                            <option value="Keluar">Barang Keluar</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="kode" className="block text-sm font-medium text-gray-700 mb-1">Kode Status <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="kode"
                                            className={`w-full border ${formErrors.kode ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg px-3 py-2 text-sm outline-none transition-colors`}
                                            placeholder="Contoh: S-01"
                                            value={formData.kode}
                                            onChange={(e) => setFormData({...formData, kode: e.target.value})}
                                        />
                                        {formErrors.kode && <p className="mt-1 text-xs text-red-500">{formErrors.kode}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Status <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            id="nama"
                                            className={`w-full border ${formErrors.nama ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg px-3 py-2 text-sm outline-none transition-colors`}
                                            placeholder="Contoh: Pending"
                                            value={formData.nama}
                                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                        />
                                        {formErrors.nama && <p className="mt-1 text-xs text-red-500">{formErrors.nama}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                                        <textarea
                                            id="keterangan"
                                            rows="3"
                                            className="w-full border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                                            placeholder="Penjelasan opsional mengenai status ini..."
                                            value={formData.keterangan || ''}
                                            onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Simpan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hapus */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsDeleteModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                            Hapus Status
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Apakah Anda yakin ingin menghapus status <span className="font-semibold text-gray-700">{itemToDelete?.nama}</span>? Data yang dihapus tidak dapat dikembalikan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Ya, Hapus
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusTransaksi;
