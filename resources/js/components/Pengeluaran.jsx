import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { PackageMinus, Search, Plus, CheckCircle, XCircle, Clock, Eye, AlertCircle, FileText, Trash2, ChevronDown, CloudCog, Download } from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';
import { formatDate } from '../utils/dateFormatter';

const BarangAutocomplete = ({ value, onChange, placeholder }) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchOptions = async () => {
            if (query.trim() === '') {
                setOptions([]);
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get('/api/barang', {
                    params: { search: query, per_page: 15 }
                });
                const data = response.data.data || response.data;
                setOptions(data.map(item => ({
                    id: item.id,
                    label: `${item.kode_barang} - ${item.nama_barang}`,
                    nama_barang: item.nama_barang,
                    kode_barang: item.kode_barang,
                    total_stok: item.total_stok || 0,
                    satuan: item.satuan?.nama_satuan || item.satuan?.simbol || 'Unit',
                    kategori: item.kategori?.nama || '-'
                })));
            } catch (error) {
                console.error('Error fetching barang options:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchOptions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    if (value) onChange('', null);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder || 'Cari nama barang...'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2]"
            />
            {isOpen && query.trim() !== '' && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 text-sm text-slate-500 text-center">Mencari...</div>
                    ) : options.length > 0 ? (
                        <ul className="py-1">
                            {options.map((opt) => (
                                <li
                                    key={opt.id}
                                    onClick={() => {
                                        onChange(opt.id, opt);
                                        setQuery(opt.label);
                                        setIsOpen(false);
                                    }}
                                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm flex flex-col"
                                >
                                    <span className="font-semibold text-slate-800">{opt.nama_barang}</span>
                                    <span className="text-xs text-slate-500">
                                        Kode: {opt.kode_barang} | Stok: {opt.total_stok} {opt.satuan} | Kategori: {opt.kategori}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-sm text-slate-500 text-center">Barang tidak ditemukan</div>
                    )}
                </div>
            )}
        </div>
    );
};

const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayValue = isOpen ? query : (selectedOption ? selectedOption.label : '');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(query.toLowerCase()));

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        if (value) onChange('');
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2] pr-10 cursor-text"
                />
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onChange(opt.value);
                                    setQuery('');
                                    setIsOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer text-sm hover:bg-slate-50 ${String(value) === String(opt.value) ? 'bg-blue-50 text-[#0266a2] font-medium' : 'text-slate-700'}`}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-slate-500 text-center">Tidak ditemukan</div>
                    )}
                </div>
            )}
        </div>
    );
};

const Pengeluaran = ({ isVerifikasiMode = false }) => {
    const { user } = useAuth();
    const [transaksiList, setTransaksiList] = useState([]);
    const [batchBarang, setBatchBarang] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modals
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedTransaksi, setSelectedTransaksi] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        items: [{ barang_id: '', jumlah: '' }],
        keperluan: '',
        ruang_laboratorium_id: '',
        jenis_kegiatan: '',
        judul_kegiatan: '',
        prodi_mitra: ''
    });

    const [petugasGudangOptions, setPetugasGudangOptions] = useState([]);
    const [selectedPetugasGudang, setSelectedPetugasGudang] = useState('');
    const [ruangOptions, setRuangOptions] = useState([]);

    const activeRole = localStorage.getItem('activeRole') || '';
    const isLaboran = activeRole === 'Laboran';
    const isPetugasGudang = activeRole === 'Petugas Gudang';
    const isKoordinator = activeRole === 'Koordinator Gudang' || activeRole === 'Koordinator';

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'warning' });
    const showConfirm = (title, message, onConfirm, variant = 'warning') => {
        setConfirmModal({ isOpen: true, title, message, onConfirm, variant });
    };
    const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchData();
        if (isPetugasGudang) {
            fetchBatchBarang();
        }
        if (isKoordinator) {
            fetchPetugasGudang();
        }
        if (isLaboran) {
            fetchRuang();
        }
    }, [activeRole, isKoordinator, isLaboran]);

    // Load petugas ketika modal verifikasi dibuka (khusus koordinator)
    useEffect(() => {
        if (isKoordinator && isVerifyModalOpen) {
            fetchPetugasGudang();
        }
    }, [isVerifyModalOpen, isKoordinator]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let params = {};
            if (isVerifikasiMode) {
                if (isKoordinator) params.status_kode = 'BK-PENDING';
                else if (isPetugasGudang) params.status_kode = 'BK-DISETUJUI';
            } else {
                // Not verifikasi mode, fetch everything then filter in frontend
            }

            const response = await axios.get('/api/pengeluaran', { params });
            setTransaksiList(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching pengeluaran:', error);
            setIsLoading(false);
        }
    };



    const fetchBatchBarang = async () => {
        try {
            // Need API to get batch barang with > 0 stok. Currently we might not have a dedicated endpoint,
            // we will just use API or maybe I need to create one? 
            // Wait, for now we can just assume there's an API for it or create it later.
            // But let me use dummy for now or just fetch it. 
            // Oh, I will create an endpoint for getting available batch.
            const response = await axios.get('/api/barang');
            // Actually, master-barang doesn't return batches. I should just let the user type or fetch.
            // Since we need to select batch, I'll assume we can get it from '/api/batch-barang'.
            // For now, I'll set empty and implement it shortly.
        } catch (error) {
            console.error('Error fetching batch barang:', error);
        }
    };

    const fetchPetugasGudang = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/petugas-gudang?all=true', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPetugasGudangOptions(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch petugas gudang:', error);
        }
    };

    const fetchRuang = async () => {
        try {
            const response = await axios.get('/api/ruang-laboratorium?per_page=-1');
            setRuangOptions(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch ruang laboratorium:', error);
        }
    };

    // Form Handlers
    const handleItemChange = (index, field, value, opt = null) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'barang_id') {
            if (opt) {
                newItems[index]['barangData'] = opt;
            } else {
                newItems[index]['barangData'] = null;
            }
        } else if (field === 'jumlah') {
            const barangData = newItems[index].barangData;
            if (barangData && parseFloat(value) > parseFloat(barangData.total_stok)) {
                toast.error(`Jumlah tidak boleh melebihi stok tersedia (${barangData.total_stok} ${barangData.satuan})`);
                newItems[index].jumlah = barangData.total_stok;
                setFormData({ ...formData, items: newItems });
                return;
            }
        }
        setFormData({ ...formData, items: newItems });
    };

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { barang_id: '', jumlah: '' }]
        });
    };

    const removeItemRow = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitPengeluaran = (e) => {
        e.preventDefault();
        // Validasi jumlah vs stok
        for (const item of formData.items) {
            if (!item.barang_id) {
                toast.error('Silakan pilih barang terlebih dahulu.');
                return;
            }
            if (!item.jumlah || parseFloat(item.jumlah) <= 0) {
                toast.error('Jumlah barang harus lebih dari 0.');
                return;
            }
            if (item.barangData && parseFloat(item.jumlah) > parseFloat(item.barangData.total_stok)) {
                toast.error(`Jumlah ${item.barangData.nama_barang} melebihi stok tersedia (${item.barangData.total_stok} ${item.barangData.satuan}).`);
                return;
            }
        }
        showConfirm(
            'Kirim Permintaan Bahan?',
            'Setelah dikirim, permintaan ini akan diteruskan ke Koordinator Gudang untuk diverifikasi. Pastikan data yang diinput sudah benar.',
            () => doSubmitPengeluaran(),
            'info'
        );
    };

    const doSubmitPengeluaran = async () => {
        setIsSubmitting(true);
        try {
            await axios.post('/api/pengeluaran', formData);
            setIsInputModalOpen(false);
            setFormData({
                items: [{ barang_id: '', jumlah: '' }],
                keperluan: '',
                ruang_laboratorium_id: '',
                jenis_kegiatan: '',
                judul_kegiatan: '',
                prodi_mitra: ''
            });
            fetchData();
            toast.success('Permintaan bahan berhasil dikirim dan menunggu verifikasi Koordinator.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim permintaan bahan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitVerify = async (status) => {
        if (status === 'Disetujui' && !selectedPetugasGudang) {
            toast.error('Silakan pilih Petugas Gudang yang akan mengeksekusi pengeluaran ini.');
            return;
        }
        showConfirm(
            'Konfirmasi Verifikasi',
            `Apakah Anda yakin ingin memberikan status "${status}" pada transaksi ini?`,
            async () => {
                try {
                    const payload = { status };
                    if (status === 'Disetujui') payload.petugas_gudang_id = selectedPetugasGudang;
                    await axios.put(`/api/pengeluaran/${selectedTransaksi.id}/verify`, payload);
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success(`Pengajuan bahan telah ${status.toLowerCase()}.`);
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal memverifikasi.');
                }
            },
            status === 'Ditolak' ? 'danger' : 'info'
        );
        return;
        // Logic moved into showConfirm callback above
    };

    const submitExecute = async () => {
        showConfirm(
            'Konfirmasi Eksekusi',
            'Apakah Anda yakin telah mengeksekusi/menyiapkan pengeluaran ini secara fisik?',
            async () => {
                try {
                    await axios.put(`/api/pengeluaran/${selectedTransaksi.id}/execute`);
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success('Pengeluaran berhasil disiapkan.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal mengeksekusi.');
                }
            },
            'warning'
        );
    };

    const submitConfirm = async () => {
        showConfirm(
            'Konfirmasi Penerimaan',
            'Apakah Anda yakin telah menerima barang ini?',
            async () => {
                try {
                    await axios.put(`/api/pengeluaran/${selectedTransaksi.id}/confirm`);
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success('Penerimaan berhasil dikonfirmasi.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal mengonfirmasi.');
                }
            },
            'info'
        );
    };

    const downloadPdf = async (id) => {
        try {
            const response = await axios.get(`/api/pengeluaran/${id}/download-pdf`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `Bukti-Pengeluaran-PB-${String(id).padStart(6, '0')}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('PDF berhasil diunduh.');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Gagal mengunduh PDF.');
        }
    };

    const filteredData = transaksiList.filter(t => {
        if (isVerifikasiMode) {
            if (isKoordinator && t.status_transaksi?.kode !== 'BK-PENDING') return false;
            if (isPetugasGudang && (t.status_transaksi?.kode !== 'BK-DISETUJUI' || t.transaksi?.dieksekusi_oleh !== user?.id)) return false;
        }
        
        const search = searchTerm.toLowerCase();
        const keperluan = (t.transaksi?.keperluan || t.jenis_kegiatan || '').toLowerCase();
        const pengaju = (t.transaksi?.pengaju?.name || t.creator?.name || '').toLowerCase();
        
        return keperluan.includes(search) || pengaju.includes(search);
    });

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Menunggu Verifikasi Koordinator</span>;
            case 'Disetujui': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Menunggu Eksekusi Petugas</span>;
            case 'Menunggu Konfirmasi': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Menunggu Konfirmasi Laboran</span>;
            case 'Selesai': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Selesai</span>;
            case 'Ditolak': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center gap-1 w-max"><XCircle className="w-3 h-3" /> Ditolak</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {!isVerifikasiMode && (
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <PackageMinus className="w-7 h-7 text-[#0266a2]" />
                            {isLaboran ? 'Permintaan Bahan' : 'Barang Keluar'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola dan pantau alur {isLaboran ? 'permintaan' : 'pengeluaran'} barang.</p>
                    </div>
                )}

                {isLaboran && (
                    <button
                        onClick={() => setIsInputModalOpen(true)}
                        className="px-4 py-2.5 bg-[#0266a2] text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold shadow-sm w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" /> Buat Pengajuan
                    </button>
                )}
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
                            placeholder="Cari transaksi (pengaju atau keperluan)..."
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
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Pengaju</th>
                                <th className="px-6 py-4">Kegiatan</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-[#0266a2]/20 border-t-[#0266a2] rounded-full animate-spin"></div>
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <PackageMinus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-base font-medium text-slate-900">Belum ada transaksi pengeluaran</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(transaksi => (
                                    <tr key={transaksi.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(transaksi.created_at)}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{transaksi.creator?.name || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{transaksi.judul_kegiatan || transaksi.transaksi?.keperluan || '-'}</td>
                                        <td className="px-6 py-4 text-slate-700">
                                            <div className="font-semibold">{transaksi.transaksi?.barang?.nama_barang}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                Total: {transaksi.transaksi?.jumlah} {transaksi.transaksi?.barang?.satuan?.singkatan || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(transaksi.status_transaksi?.nama || 'Pending')}</td>
                                        <td className="px-6 py-4 text-right">
                                            {isPetugasGudang && transaksi.status_transaksi?.nama === 'Disetujui' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedTransaksi(transaksi);
                                                        setIsVerifyModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 rounded-lg mr-2 transition-all shadow-sm flex items-center inline-flex gap-1.5"
                                                >
                                                    <PackageMinus className="w-3.5 h-3.5" />
                                                    Eksekusi Barang
                                                </button>
                                            )}
                                            {isLaboran && transaksi.status_transaksi?.nama === 'Menunggu Konfirmasi' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedTransaksi(transaksi);
                                                        setIsVerifyModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg mr-2 transition-all shadow-sm shadow-emerald-200 flex items-center inline-flex gap-1.5"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Konfirmasi Terima
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedTransaksi(transaksi);
                                                    setIsVerifyModalOpen(true);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat Detail / Verifikasi"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {transaksi.status_transaksi?.nama === 'Selesai' && (
                                                <button
                                                    onClick={() => downloadPdf(transaksi.id)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors ml-1"
                                                    title="Download Bukti PDF"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            )}
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

            {/* Input Pengeluaran Modal (Laboran) */}
            {isInputModalOpen && isLaboran && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#0266a2]" />
                                Input Permintaan Bahan
                            </h3>
                            <button onClick={() => setIsInputModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitPengeluaran} className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ruang Laboratorium</label>
                                    <SearchableDropdown
                                        options={ruangOptions.map(r => ({ value: r.id, label: r.nama }))}
                                        value={formData.ruang_laboratorium_id}
                                        onChange={(val) => setFormData({ ...formData, ruang_laboratorium_id: val })}
                                        placeholder="Cari ruang lab..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis Kegiatan</label>
                                    <SearchableDropdown
                                        options={[
                                            { value: 'Praktikum', label: 'Praktikum' },
                                            { value: 'Penelitian', label: 'Penelitian' },
                                            { value: 'Perawatan', label: 'Perawatan' },
                                            { value: 'Operasional', label: 'Operasional' }
                                        ]}
                                        value={formData.jenis_kegiatan}
                                        onChange={(val) => setFormData({ ...formData, jenis_kegiatan: val })}
                                        placeholder="Cari jenis kegiatan..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Kegiatan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.judul_kegiatan}
                                        onChange={(e) => setFormData({ ...formData, judul_kegiatan: e.target.value })}
                                        placeholder="Contoh: Fisika Dasar 2"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prodi / Mitra</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.prodi_mitra}
                                        onChange={(e) => setFormData({ ...formData, prodi_mitra: e.target.value })}
                                        placeholder="Contoh: TPB"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 text-sm">Daftar Barang</h4>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Cari Barang</label>
                                                <BarangAutocomplete
                                                    value={item.barang_id}
                                                    onChange={(val, opt) => handleItemChange(index, 'barang_id', val, opt)}
                                                    placeholder="Ketik nama barang..."
                                                />
                                                {item.barangData && (
                                                    <p className="mt-1 text-xs text-[#0266a2] font-medium flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Stok Tersedia: {item.barangData.total_stok} {item.barangData.satuan}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        min="0.01"
                                                        step="0.01"
                                                        max={item.barangData ? item.barangData.total_stok : ""}
                                                        value={item.jumlah}
                                                        onChange={(e) => handleItemChange(index, 'jumlah', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(index)}
                                                className="p-2 mt-6 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    className="w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-500 font-semibold text-sm rounded-xl hover:border-[#0266a2] hover:text-[#0266a2] hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Tambah Barang
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                                <button type="button" onClick={() => setIsInputModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Mengirim...
                                        </>
                                    ) : 'Kirim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Verify/Detail Modal */}
            {isVerifyModalOpen && selectedTransaksi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0266a2]" />
                                Detail Permintaan Bahan
                            </h3>
                            <button onClick={() => setIsVerifyModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Status</span>
                                    {getStatusBadge(selectedTransaksi.status_transaksi?.nama || 'Pending')}
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Tanggal & Waktu</span>
                                    <div className="font-semibold text-slate-800">{formatDate(selectedTransaksi.created_at || selectedTransaksi.tanggal_waktu)}</div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Penanggung Jawab</span>
                                    <div className="font-semibold text-slate-800">{selectedTransaksi.pengaju?.name || '-'}</div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Ruang Laboratorium</span>
                                    <div className="font-semibold text-slate-800">{selectedTransaksi.ruang_laboratorium?.nama || '-'}</div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Kegiatan</span>
                                    <div className="font-semibold text-slate-800">
                                        {selectedTransaksi.jenis_kegiatan ? `${selectedTransaksi.jenis_kegiatan} - ${selectedTransaksi.judul_kegiatan}` : (selectedTransaksi.keperluan || '-')}
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Prodi / Mitra</span>
                                    <div className="font-semibold text-slate-800">{selectedTransaksi.prodi_mitra || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-3">Item Pengeluaran</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Kode Barang</th>
                                                <th className="px-4 py-3">Nama Barang</th>
                                                <th className="px-4 py-3">Jumlah Diminta</th>
                                                <th className="px-4 py-3 text-right">Sisa Barang</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {selectedTransaksi.transaksi?.barang?.kode_barang || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {selectedTransaksi.transaksi?.barang?.nama_barang || '-'}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-[#0266a2]">
                                                    {selectedTransaksi.transaksi?.jumlah} {selectedTransaksi.transaksi?.barang?.satuan?.singkatan || ''}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600">
                                                    {selectedTransaksi.transaksi?.barang?.total_stok || 0} {selectedTransaksi.transaksi?.barang?.satuan?.singkatan || ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Riwayat Verifikasi */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">Riwayat Verifikasi</h4>
                                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-800 text-sm">Pengajuan Dibuat</div>
                                                <div className="text-xs font-medium text-slate-500">{formatDate(selectedTransaksi.created_at)}</div>
                                            </div>
                                            <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.pengaju?.name} (Laboran)</div>
                                        </div>
                                    </div>

                                    {selectedTransaksi.status_transaksi?.nama !== 'Pending' && (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                                {selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className={`font-bold text-sm ${selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'text-rose-700' : 'text-blue-700'}`}>
                                                        {selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'Ditolak' : 'Disetujui'}
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500">{selectedTransaksi.disetujui_oleh ? formatDate(selectedTransaksi.updated_at) : ''}</div>
                                                </div>
                                                <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.penyetuju?.name || 'Koordinator'}</div>
                                            </div>
                                        </div>
                                    )}

                                    {(selectedTransaksi.status_transaksi?.nama === 'Menunggu Konfirmasi' || selectedTransaksi.status_transaksi?.nama === 'Selesai') && (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <PackageMinus className="w-4 h-4" />
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-indigo-700 text-sm">Pengeluaran Fisik</div>
                                                </div>
                                                <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.eksekutor?.name || 'Petugas Gudang'}</div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTransaksi.status_transaksi?.nama === 'Selesai' && (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-emerald-700 text-sm">Selesai</div>
                                                    <div className="text-xs font-medium text-slate-500">{formatDate(selectedTransaksi.updated_at)}</div>
                                                </div>
                                                <div className="text-sm text-slate-600">Diterima oleh: {selectedTransaksi.pengaju?.name}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons based on Role & Status */}
                            {selectedTransaksi.status_transaksi?.nama === 'Pending' && isKoordinator && (
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tugaskan Petugas Gudang <span className="text-rose-500">*</span></label>
                                        <select
                                            value={selectedPetugasGudang}
                                            onChange={(e) => setSelectedPetugasGudang(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                                        >
                                            <option value="">-- Pilih Petugas Gudang --</option>
                                            {petugasGudangOptions.map(p => (
                                                <option key={p.id} value={p.id}>{p.laboran?.user?.name} - {p.kategori_rumpun?.nama_rumpun}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => submitVerify('Ditolak')}
                                            className="px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" /> Tolak
                                        </button>
                                        <button
                                            onClick={() => submitVerify('Disetujui')}
                                            disabled={!selectedPetugasGudang}
                                            className={"px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center gap-2 shadow-sm" + (selectedPetugasGudang ? '' : ' opacity-50 cursor-not-allowed')}
                                        >
                                            <CheckCircle className="w-4 h-4" /> Setujui
                                        </button>
                                    </div>
                                </div>
                            )}



                            {selectedTransaksi.status_transaksi?.nama === 'Selesai' && (
                                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        onClick={() => downloadPdf(selectedTransaksi.id)}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0266a2] to-[#0284c7] hover:from-[#01578a] hover:to-[#0369a1] rounded-xl flex items-center gap-2 shadow-sm w-full justify-center transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Download Bukti PDF
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Bottom Bar: Action Buttons & Tutup */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row justify-end items-center gap-4">
                            
                            {isPetugasGudang && selectedTransaksi.status_transaksi?.nama === 'Disetujui' && selectedTransaksi.transaksi?.dieksekusi_oleh === user?.id && (
                                <button
                                    onClick={submitExecute}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-all"
                                >
                                    <PackageMinus className="w-4 h-4" /> Eksekusi Pengeluaran Fisik
                                </button>
                            )}

                            {selectedTransaksi.status_transaksi?.nama === 'Menunggu Konfirmasi' && isLaboran && selectedTransaksi.created_by === user?.id && (
                                <button
                                    onClick={submitConfirm}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" /> Konfirmasi Barang Diterima
                                </button>
                            )}

                            <button onClick={() => setIsVerifyModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm w-full sm:w-auto justify-center">Tutup</button>
                        </div>
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

export default Pengeluaran;
