import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PackagePlus, Search, Plus, CheckCircle, XCircle, Clock, Eye, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';
import { formatDate } from '../utils/dateFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableSelect from './SearchableSelect';
import ImportBarangMasukModal from './ImportBarangMasukModal';

// Tampilkan angka dengan pemisah ribuan Indonesia (titik); nilai di state tetap mentah.
const formatRibuan = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return '';
    const n = Number(String(raw).replace(/[^\d]/g, ''));
    return isNaN(n) ? '' : n.toLocaleString('id-ID');
};

const PenerimaanBarang = ({ isVerifikasiMode = false }) => {
    const { user } = useAuth();
    const [transaksiList, setTransaksiList] = useState([]);
    const [masterBarang, setMasterBarang] = useState([]);
    const [laboranList, setLaboranList] = useState([]);
    const [penyediaList, setPenyediaList] = useState([]);
    const [jenisKegiatanList, setJenisKegiatanList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    
    // Modals
    const [isInputModalOpen, setIsInputModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedTransaksi, setSelectedTransaksi] = useState(null);
    const [verifyJumlah, setVerifyJumlah] = useState('');
    const [verifyCatatan, setVerifyCatatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openVerifyModal = (t) => {
        setSelectedTransaksi(t);
        setVerifyJumlah(t.transaksi?.jumlah ?? '');
        setVerifyCatatan('');
        setIsVerifyModalOpen(true);
    };

    // Form State
    const emptyItem = {
        barang_id: '',
        jumlah: '',
        kondisi: 'Baik',
        harga_total: '',
        status_kadaluarsa: '',
        tgl_kadaluarsa: '',
        no_po: ''
    };
    const todayStr = new Date().toISOString().slice(0, 10);
    const emptyForm = {
        tanggal: todayStr,
        penyedia_id: '',
        jenis_kegiatan_id: '',
        laboran_id: '',
        link_pengadaan: '',
        keperluan: '',
        items: [{ ...emptyItem }]
    };
    const [formData, setFormData] = useState({ ...emptyForm });

    const activeRole = localStorage.getItem('activeRole') || '';
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
            fetchMasterBarang();
            fetchLaboran();
            fetchPenyedia();
            fetchJenisKegiatan();
        }
    }, [activeRole]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const activeRole = localStorage.getItem('activeRole') || '';
            const isKoordinator = activeRole === 'Koordinator Gudang' || activeRole === 'Koordinator';
            const isPetugasGudang = activeRole === 'Petugas Gudang';

            let params = {};
            if (isVerifikasiMode) {
                if (isKoordinator || isPetugasGudang) params.status_kode = 'BM-PENDING';
            }

            const response = await axios.get('/api/penerimaan', { params });
            setTransaksiList(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching penerimaan:', error);
            setIsLoading(false);
        }
    };

    const fetchMasterBarang = async () => {
        try {
            const response = await axios.get('/api/barang');
            setMasterBarang(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching master barang:', error);
        }
    };

    const fetchLaboran = async () => {
        try {
            const response = await axios.get('/api/laboran');
            setLaboranList(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching laboran:', error);
        }
    };

    const fetchPenyedia = async () => {
        try {
            const response = await axios.get('/api/penyedia');
            setPenyediaList(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching penyedia:', error);
        }
    };

    const fetchJenisKegiatan = async () => {
        try {
            const response = await axios.get('/api/jenis-kegiatan', { params: { aktif: 1 } });
            setJenisKegiatanList(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching jenis kegiatan:', error);
        }
    };

    // Form Handlers
    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const addItemRow = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { ...emptyItem }]
        });
    };

    const removeItemRow = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;
        const anyOpen = isInputModalOpen || isVerifyModalOpen || confirmModal.isOpen;
        mainEl.style.overflowY = anyOpen ? 'hidden' : '';
        return () => { mainEl.style.overflowY = ''; };
    }, [isInputModalOpen, isVerifyModalOpen, confirmModal.isOpen]);

    const submitPenerimaan = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        const jumlahBarang = formData.items.length;
        showConfirm(
            'Konfirmasi Penerimaan',
            `Kirim ${jumlahBarang} barang ini untuk diverifikasi Koordinator? Pastikan data sudah benar.`,
            async () => {
                setIsSubmitting(true);
                try {
                    await axios.post('/api/penerimaan', formData);
                    setIsInputModalOpen(false);
                    setFormData({ ...emptyForm, items: [{ ...emptyItem }] });
                    fetchData();
                    toast.success('Penerimaan berhasil diajukan dan menunggu verifikasi.');
                } catch (error) {
                    if (error.response?.status === 422) {
                        const errs = error.response.data?.errors || {};
                        const first = Object.values(errs)[0];
                        toast.error(first ? first[0] : 'Periksa kembali isian form.');
                    } else {
                        toast.error('Gagal menyimpan data.');
                    }
                } finally {
                    setIsSubmitting(false);
                }
            },
            'info'
        );
    };

    const submitVerify = async (status) => {
        const jumlahAsli = selectedTransaksi?.transaksi?.jumlah;
        const adaKoreksi = status === 'Disetujui' && Number(verifyJumlah) !== Number(jumlahAsli);
        const pesan = adaKoreksi
            ? `Jumlah akan dikoreksi dari ${jumlahAsli} menjadi ${verifyJumlah} lalu disetujui. Lanjutkan?`
            : `Apakah Anda yakin ingin memberikan status "${status}" pada transaksi ini?`;
        showConfirm(
            'Konfirmasi Verifikasi',
            pesan,
            async () => {
                try {
                    const payload = { status };
                    if (status === 'Disetujui') {
                        payload.jumlah_diterima = verifyJumlah;
                        if (verifyCatatan) payload.catatan = verifyCatatan;
                    }
                    await axios.put(`/api/penerimaan/${selectedTransaksi.id}/verify`, payload);
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success(`Data penerimaan barang telah ${status.toLowerCase()}.`);
                } catch (error) {
                    toast.error('Gagal memverifikasi.');
                }
            },
            status === 'Ditolak' ? 'danger' : 'info'
        );
    };

    const filteredData = transaksiList.filter(t => {
        const isValidStatus = !isVerifikasiMode || t.status_transaksi?.kode === 'BM-PENDING';
        if (!isValidStatus) return false;

        const search = searchTerm.toLowerCase();
        const kegiatan = (t.jenis_kegiatan || '').toLowerCase();
        const creator = (t.creator?.name || t.laboran?.user?.name || '').toLowerCase();
        
        return kegiatan.includes(search) || creator.includes(search);
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
            case 'Pending': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Menunggu Verifikasi Koordinator</span>;
            case 'Disetujui': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Disetujui</span>;
            case 'Ditolak': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Ditolak</span>;
            default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {!isVerifikasiMode && (
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <PackagePlus className="w-7 h-7 text-[#0266a2]" />
                            Penerimaan Barang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Kelola dan pantau alur penerimaan barang ke dalam gudang.</p>
                    </div>
                )}
                
                {isPetugasGudang && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-2 mt-4 sm:mt-0">
                        <button 
                            onClick={() => setIsImportModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <FileSpreadsheet className="w-4 h-4 shrink-0" />
                            <span>Import XLSX</span>
                        </button>
                        <button 
                            onClick={() => setIsInputModalOpen(true)}
                            className="bg-[#0266a2] hover:bg-blue-700 text-white w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Input Penerimaan</span>
                        </button>
                    </div>
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
                            placeholder="Cari transaksi..." 
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
                                <th className="px-6 py-4">Kegiatan / Sumber</th>
                                <th className="px-6 py-4">Petugas Gudang</th>
                                <th className="px-6 py-4">PIC Penerima</th>
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
                                        <PackagePlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-base font-medium text-slate-900">Belum ada transaksi penerimaan</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{formatDate(t.created_at)}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{t.jenis_kegiatan || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">{t.creator?.name || '-'}</td>
                                        <td className="px-6 py-4 text-slate-700">{t.laboran?.user?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(t.status_transaksi?.nama || 'Pending')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openVerifyModal(t)}
                                                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all shadow-sm flex items-center inline-flex gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Detail
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

            {/* Input Penerimaan Modal (Petugas Gudang) */}
            <AnimatePresence>
            {isInputModalOpen && isPetugasGudang && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={() => setIsInputModalOpen(false)}>
                        <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-8 sm:my-10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#0266a2]" />
                                Input Penerimaan Barang
                            </h3>
                            <button onClick={() => setIsInputModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={submitPenerimaan} className="p-6 space-y-6">
                            
                            {/* Header — berlaku untuk semua barang dalam penerimaan ini */}
                            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Penerimaan</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.tanggal}
                                        onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Penyedia / Vendor</label>
                                    <SearchableSelect
                                        value={formData.penyedia_id}
                                        onChange={(e) => setFormData({...formData, penyedia_id: e.target.value})}
                                        options={penyediaList.map(p => ({ value: p.id, label: `${p.kode_penyedia || '-'} - ${p.nama_penyedia}` }))}
                                        placeholder="-- Pilih Penyedia --"
                                        size="sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kegiatan</label>
                                    <select
                                        required
                                        value={formData.jenis_kegiatan_id}
                                        onChange={(e) => setFormData({...formData, jenis_kegiatan_id: e.target.value})}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {jenisKegiatanList.map(jk => (
                                            <option key={jk.id} value={jk.id}>{jk.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">PIC Barang Masuk (Laboran)</label>
                                    <SearchableSelect
                                        value={formData.laboran_id}
                                        onChange={(e) => setFormData({...formData, laboran_id: e.target.value})}
                                        options={laboranList.map(l => ({ value: l.id, label: l.user?.name || 'Laboran' }))}
                                        placeholder="-- Pilih Laboran --"
                                        size="sm"
                                    />
                                </div>
                                {(() => {
                                    const headerJk = jenisKegiatanList.find(j => String(j.id) === String(formData.jenis_kegiatan_id));
                                    const wajibLink = !!headerJk?.wajib_link_pengadaan;
                                    return (
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Link Bukti Pengadaan / Invoice {wajibLink ? <span className="text-rose-500">*</span> : <span className="font-normal text-slate-400">(Opsional)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                required={wajibLink}
                                                value={formData.link_pengadaan}
                                                onChange={(e) => setFormData({...formData, link_pengadaan: e.target.value})}
                                                placeholder="Contoh: https://drive.google.com/..."
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                            />
                                            {wajibLink && <p className="text-[11px] text-amber-600 mt-1">Wajib untuk kegiatan {headerJk.nama}.</p>}
                                        </div>
                                    );
                                })()}
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.keperluan}
                                        onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                                        placeholder="Contoh: Penerimaan PO Bulan Juni"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2] focus:ring-1 focus:ring-[#0266a2]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-800 text-sm">Daftar Barang</h4>
                                    <button type="button" onClick={addItemRow} className="text-xs font-semibold text-[#0266a2] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                        + Tambah Baris
                                    </button>
                                </div>

                                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2.5 text-left w-10">No</th>
                                                <th className="px-3 py-2.5 text-left min-w-[220px]">Barang</th>
                                                <th className="px-3 py-2.5 text-left min-w-[120px]">Jumlah</th>
                                                <th className="px-3 py-2.5 text-left min-w-[170px]">Harga Total (Rp)</th>
                                                <th className="px-3 py-2.5 text-left min-w-[140px] whitespace-nowrap">Harga Satuan</th>
                                                <th className="px-3 py-2.5 text-left min-w-[190px]">Kadaluarsa</th>
                                                <th className="px-3 py-2.5 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {formData.items.map((item, index) => {
                                                const selectedBarang = masterBarang.find(mb => String(mb.id) === String(item.barang_id));
                                                const isDesimal = selectedBarang?.satuan?.is_desimal ?? false;
                                                const perluKadaluarsa = !!selectedBarang?.perlu_kadaluarsa;
                                                const isTerisi = item.status_kadaluarsa === 'Terisi';
                                                const hSat = (Number(item.harga_total) > 0 && Number(item.jumlah) > 0)
                                                    ? `Rp ${(Number(item.harga_total) / Number(item.jumlah)).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`
                                                    : '—';
                                                return (
                                                    <tr key={index} className="align-top">
                                                        <td className="px-3 py-3 text-slate-500 font-medium">{index + 1}</td>
                                                        <td className="px-3 py-3">
                                                            <SearchableSelect
                                                                value={item.barang_id}
                                                                onChange={(e) => handleItemChange(index, 'barang_id', e.target.value)}
                                                                options={masterBarang.map(mb => ({ value: mb.id, label: `${mb.kode_barang} - ${mb.nama_barang}` }))}
                                                                placeholder="-- Pilih --"
                                                                size="sm"
                                                                className="w-full"
                                                            />
                                                            {selectedBarang && (
                                                                <p className="text-[11px] text-slate-400 mt-1">Satuan: {selectedBarang.satuan?.simbol || selectedBarang.satuan?.nama_satuan || '-'}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {isDesimal ? (
                                                                <input
                                                                    type="number" required
                                                                    min="0.001" step="0.001"
                                                                    value={item.jumlah}
                                                                    onChange={(e) => handleItemChange(index, 'jumlah', e.target.value)}
                                                                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text" inputMode="numeric" required
                                                                    value={formatRibuan(item.jumlah)}
                                                                    onChange={(e) => handleItemChange(index, 'jumlah', e.target.value.replace(/[^\d]/g, ''))}
                                                                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <input
                                                                type="text" inputMode="numeric" required
                                                                value={formatRibuan(item.harga_total)}
                                                                onChange={(e) => handleItemChange(index, 'harga_total', e.target.value.replace(/[^\d]/g, ''))}
                                                                placeholder="incl. PPN"
                                                                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{hSat}</td>
                                                        <td className="px-3 py-3">
                                                            {perluKadaluarsa ? (
                                                                <div className="space-y-1.5">
                                                                    <select
                                                                        required
                                                                        value={item.status_kadaluarsa}
                                                                        onChange={(e) => handleItemChange(index, 'status_kadaluarsa', e.target.value)}
                                                                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                                    >
                                                                        <option value="">-- Status (FEFO) --</option>
                                                                        <option value="Terisi">Terisi (ada tanggal)</option>
                                                                        <option value="TidakDicantumkan">Tidak dicantumkan</option>
                                                                        <option value="BelumDiinput">Belum diinput</option>
                                                                    </select>
                                                                    {isTerisi && (
                                                                        <input
                                                                            type="date" required
                                                                            value={item.tgl_kadaluarsa}
                                                                            onChange={(e) => handleItemChange(index, 'tgl_kadaluarsa', e.target.value)}
                                                                            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">Tidak berlaku</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            {formData.items.length > 1 && (
                                                                <button type="button" onClick={() => removeItemRow(index)} className="text-rose-400 hover:text-rose-600" title="Hapus baris">
                                                                    <XCircle className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" disabled={isSubmitting} onClick={() => setIsInputModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                                    {isSubmitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                                    {isSubmitting ? 'Mengirim...' : 'Kirim'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                        </div>
                    </div>
                </div>
            )}
            </AnimatePresence>

            {/* Verifikasi / Detail Modal */}
            <AnimatePresence>
            {isVerifyModalOpen && selectedTransaksi && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>
                    <div className="fixed inset-0 overflow-y-auto" onClick={() => setIsVerifyModalOpen(false)}>
                        <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 sm:my-10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0266a2]" />
                                Detail Penerimaan (TRX-{selectedTransaksi.id.toString().padStart(4, '0')})
                            </h3>
                            <button onClick={() => setIsVerifyModalOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">Pengaju</p>
                                    <p className="font-medium text-slate-900">{selectedTransaksi.pengaju?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase">Tanggal & Waktu</p>
                                    <p className="font-medium text-slate-900">{formatDate(selectedTransaksi.created_at || selectedTransaksi.tanggal_waktu)}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-slate-500 font-medium mb-1">Pengaju (Petugas Gudang)</span>
                                    <p className="font-medium text-slate-900">{selectedTransaksi.keperluan}</p>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Status Saat Ini</p>
                                    {getStatusBadge(selectedTransaksi.status_transaksi?.nama || 'Pending')}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">Rincian Barang Masuk</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Nama Barang</th>
                                                <td className="px-4 py-3 font-medium text-slate-900">{selectedTransaksi.transaksi?.barang?.nama_barang}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Kategori</th>
                                                <td className="px-4 py-3 text-slate-600">{selectedTransaksi.transaksi?.barang?.kategori?.nama || '-'}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Jenis Bahaya</th>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {(selectedTransaksi.transaksi?.barang?.sifat_bahan || []).length > 0
                                                        ? selectedTransaksi.transaksi.barang.sifat_bahan.map(sb => sb.nama).join(', ')
                                                        : '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Tanggal Penerimaan</th>
                                                <td className="px-4 py-3 text-slate-700">{selectedTransaksi.transaksi?.batch_barang?.tgl_penerimaan ? formatDate(selectedTransaksi.transaksi.batch_barang.tgl_penerimaan) : '-'}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Jumlah</th>
                                                <td className="px-4 py-3 font-semibold text-[#0266a2]">{selectedTransaksi.transaksi?.jumlah} {selectedTransaksi.transaksi?.barang?.satuan?.singkatan || ''}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Harga Satuan / Total</th>
                                                <td className="px-4 py-3 text-slate-700">Rp {selectedTransaksi.harga_satuan?.toLocaleString('id-ID')} / Rp {selectedTransaksi.harga_total?.toLocaleString('id-ID')}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Penyedia / Vendor</th>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {selectedTransaksi.transaksi?.batch_barang?.penyedia
                                                        ? `${selectedTransaksi.transaksi.batch_barang.penyedia.kode_penyedia || '-'} - ${selectedTransaksi.transaksi.batch_barang.penyedia.nama_penyedia}`
                                                        : '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Nomor Batch</th>
                                                <td className="px-4 py-3 font-medium text-slate-900">{selectedTransaksi.transaksi?.batch_barang?.kode_batch || '-'}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Kadaluarsa</th>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {(() => {
                                                        const b = selectedTransaksi.transaksi?.batch_barang;
                                                        if (!b?.status_kadaluarsa && !b?.tgl_kadaluarsa) return '-';
                                                        if (b?.status_kadaluarsa === 'Terisi') return b?.tgl_kadaluarsa ? formatDate(b.tgl_kadaluarsa) : '-';
                                                        if (b?.status_kadaluarsa === 'TidakDicantumkan') return 'Tidak dicantumkan produsen';
                                                        if (b?.status_kadaluarsa === 'BelumDiinput') return 'Belum diinput (cek label)';
                                                        return b?.tgl_kadaluarsa ? formatDate(b.tgl_kadaluarsa) : '-';
                                                    })()}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Jenis Kegiatan</th>
                                                <td className="px-4 py-3 text-slate-700">{selectedTransaksi.jenis_kegiatan || '-'}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">PIC Barang Masuk</th>
                                                <td className="px-4 py-3 text-slate-700">{selectedTransaksi.laboran?.user?.name || '-'}</td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Link Bukti Pengadaan</th>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {selectedTransaksi.link_pengadaan ? (
                                                        <a href={selectedTransaksi.link_pengadaan} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                            Lihat Dokumen <Eye className="w-3 h-3"/>
                                                        </a>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700">Sumber Input</th>
                                                <td className="px-4 py-3 text-slate-700">{selectedTransaksi.sumber_input === 'csv' ? 'Import (CSV/Excel)' : 'Input Web'}</td>
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
                                            <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.pengaju?.name} (Admin Gudang)</div>
                                        </div>
                                    </div>
                                    
                                    {selectedTransaksi.status_transaksi?.nama !== 'Pending' && (
                                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${selectedTransaksi.status_transaksi?.nama === 'Disetujui' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                                {selectedTransaksi.status_transaksi?.nama === 'Disetujui' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className={`font-bold text-sm ${selectedTransaksi.status_transaksi?.nama === 'Disetujui' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {selectedTransaksi.status_transaksi?.nama}
                                                    </div>
                                                    <div className="text-xs font-medium text-slate-500">{formatDate(selectedTransaksi.updated_at)}</div>
                                                </div>
                                                <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.penyetuju?.name || 'Koordinator'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isKoordinator && selectedTransaksi.status_transaksi?.nama === 'Pending' && (() => {
                            const isDesimal = selectedTransaksi.transaksi?.barang?.satuan?.is_desimal ?? false;
                            const singkatan = selectedTransaksi.transaksi?.barang?.satuan?.singkatan || '';
                            const jumlahAsli = selectedTransaksi.transaksi?.jumlah;
                            const adaKoreksi = Number(verifyJumlah) !== Number(jumlahAsli);
                            return (
                            <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-4">
                                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>Mohon pastikan kesesuaian fisik dengan PO/Rencana. Koreksi jumlah bila fisik tidak sesuai sebelum menyetujui.</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Jumlah Diterima (Verifikasi)
                                            <span className="ml-1 font-normal text-slate-400">(input awal: {jumlahAsli} {singkatan})</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={isDesimal ? "0.001" : "1"}
                                            step={isDesimal ? "0.001" : "1"}
                                            value={verifyJumlah}
                                            onChange={(e) => setVerifyJumlah(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                        {adaKoreksi && (
                                            <p className="text-[11px] text-amber-600 mt-1">Jumlah berbeda dari input awal — akan dicatat sebagai koreksi.</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Catatan {adaKoreksi ? <span className="text-rose-500">(alasan koreksi)</span> : <span className="font-normal text-slate-400">(opsional)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            value={verifyCatatan}
                                            onChange={(e) => setVerifyCatatan(e.target.value)}
                                            placeholder={adaKoreksi ? "Contoh: 3 botol pecah saat diterima" : "Catatan verifikasi (opsional)"}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-1">
                                    <button onClick={() => submitVerify('Ditolak')} className="px-4 py-2.5 text-sm font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition-colors">Tolak</button>
                                    <button onClick={() => submitVerify('Disetujui')} className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Setujui Penerimaan
                                    </button>
                                </div>
                            </div>
                            );
                        })()}
                        {(!isKoordinator || selectedTransaksi.status_transaksi?.nama !== 'Pending') && (
                            <div className="p-6 border-t border-slate-100 text-right bg-slate-50 rounded-b-2xl">
                                <button onClick={() => setIsVerifyModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm">Tutup</button>
                            </div>
                        )}
                    </motion.div>
                        </div>
                    </div>
                </div>
            )}
            </AnimatePresence>
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
            />

            <ImportBarangMasukModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default PenerimaanBarang;
