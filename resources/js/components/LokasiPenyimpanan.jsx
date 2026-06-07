import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Plus, Pencil, Trash2, Search, XCircle } from 'lucide-react';
import axios from '../lib/axios';
import ConfirmModal from './ConfirmModal';

const LokasiPenyimpanan = () => {
    const [lokasiList, setLokasiList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, kode: '', nama: '', keterangan: '' });
    const [errors, setErrors] = useState({});

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' });
    const showConfirm = (title, message, onConfirm, variant = 'danger') => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
    };
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/lokasi-penyimpanan');
            setLokasiList(response.data.data || response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setFormData({ id: item.id, kode: item.kode, nama: item.nama, keterangan: item.keterangan || '' });
        } else {
            setFormData({ id: null, kode: '', nama: '', keterangan: '' });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await axios.put(`/api/lokasi-penyimpanan/${formData.id}`, formData);
            } else {
                await axios.post('/api/lokasi-penyimpanan', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Terjadi kesalahan saat menyimpan data.');
            }
        }
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Hapus Lokasi',
            'Apakah Anda yakin ingin menghapus lokasi ini? Data yang dihapus tidak dapat dikembalikan.',
            async () => {
                try {
                    await axios.delete(`/api/lokasi-penyimpanan/${id}`);
                    fetchData();
                    toast.success('Lokasi berhasil dihapus.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal menghapus data.');
                }
            },
            'danger'
        );
    };

    const filteredData = lokasiList.filter(l => 
        l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.kode && l.kode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.keterangan && l.keterangan.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalData = filteredData.length;
    const totalPages = Math.ceil(totalData / perPage);
    const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-7 h-7 text-[#0266a2]" />
                        Lokasi Penyimpanan
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data rak dan lokasi penyimpanan fisik.</p>
                </div>
                
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-[#0266a2] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Lokasi
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
                            placeholder="Cari lokasi atau keterangan..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Kode</th>
                                <th className="px-6 py-4">Nama Lokasi</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-[#0266a2]/20 border-t-[#0266a2] rounded-full animate-spin"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-base font-medium text-slate-900">Belum ada data lokasi</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{item.kode}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{item.nama}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.keterangan || '-'}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(item)}
                                                className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                {totalData > 0 && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Menampilkan <span className="font-semibold text-slate-700">{totalData === 0 ? 0 : (page - 1) * perPage + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(page * perPage, totalData)}</span> dari total <span className="font-semibold text-slate-700">{totalData}</span> data
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === page ? 'bg-[#0266a2] text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${page === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formData.id ? 'Edit Lokasi' : 'Tambah Lokasi'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kode Lokasi</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.kode}
                                    onChange={(e) => setFormData({...formData, kode: e.target.value})}
                                    placeholder="Contoh: LK-01"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.kode ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-[#0266a2] focus:ring-[#0266a2]'} rounded-xl text-sm focus:outline-none focus:ring-1 text-black`}
                                />
                                {errors.kode && <p className="mt-1 text-xs text-rose-500">{errors.kode[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lokasi / Rak</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.nama}
                                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                    placeholder="Contoh: Rak A-1"
                                    className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.nama ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-[#0266a2] focus:ring-[#0266a2]'} rounded-xl text-sm focus:outline-none focus:ring-1 text-black`}
                                />
                                {errors.nama && <p className="mt-1 text-xs text-rose-500">{errors.nama[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan (Opsional)</label>
                                <textarea 
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                                    placeholder="Deskripsi atau catatan khusus untuk lokasi ini"
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2] text-black"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">Batal</button>
                                <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
            />
        </div>
    );
};

export default LokasiPenyimpanan;
