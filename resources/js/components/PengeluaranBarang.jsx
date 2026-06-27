import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { PackageMinus, Search, Plus, CheckCircle, XCircle, Clock, Eye, AlertCircle, FileText, Trash2, ChevronDown, CloudCog, Download, Loader2 } from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';
import { formatDate } from '../utils/dateFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import QRScannerModal from './QRScannerModal';
import { Scan } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const BarangAutocomplete = ({ value, onChange, placeholder, onScanClick }) => {
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
                const params = { search: query, per_page: 15 };

                const response = await axios.get('/api/barang', { params });
                const data = response.data.data || response.data;
                setOptions(data.map(item => {
                    const activeBatches = item.batch_barang || [];
                    const priorityBatch = activeBatches.length > 0 ? activeBatches[0] : null;

                    return {
                        id: item.id,
                        label: `${item.kode_barang} - ${item.nama_barang}`,
                        nama_barang: item.nama_barang,
                        kode_barang: item.kode_barang,
                        total_stok: item.total_stok || 0,
                        satuan: item.satuan?.nama_satuan || 'Unit',
                        satuan_is_desimal: item.satuan?.is_desimal ?? false,
                        kategori: item.kategori?.nama || '-',
                        perlu_kadaluarsa: item.perlu_kadaluarsa,
                        fefoBatch: priorityBatch,
                        allBatches: activeBatches
                    };
                }));
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
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && options.length === 1) {
                        e.preventDefault();
                        const opt = options[0];
                        onChange(opt.id, opt);
                        setQuery(opt.label);
                        setIsOpen(false);
                    }
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder || 'Ketik nama / scan kode barang...'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0266a2] pr-10"
            />
            {onScanClick && (
                <button
                    type="button"
                    onClick={onScanClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#0266a2] hover:bg-slate-100 rounded transition-colors"
                    title="Scan QR Code / Barcode"
                >
                    <Scan className="w-5 h-5" />
                </button>
            )}
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
                                    <span className="text-xs text-slate-500 mt-0.5">
                                        Kode: {opt.kode_barang} | Stok Total: {opt.total_stok} {opt.satuan} | Kategori: {opt.kategori}
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

const PengeluaranBarang = ({ isVerifikasiMode = false }) => {
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
    const [selectedBatchId, setSelectedBatchId] = useState(''); // kept for legacy, unused in new flow
    const [alasanOverride, setAlasanOverride] = useState(''); // kept for legacy, unused in new flow
    const [exceptionMode, setExceptionMode] = useState(false);
    const [catatanException, setCatatanException] = useState('');
    // Pemilihan batch oleh Petugas Gudang saat eksekusi (khusus bahan berkadaluarsa / FEFO)
    const [batchSelection, setBatchSelection] = useState({}); // { [batchId]: jumlah }

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, variant: 'warning' });
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
                // Di daftar (non-verifikasi), Petugas Gudang juga melihat transaksi yang
                // sudah mereka eksekusi agar bisa mengunduh Surat Jalan.
                if (isPetugasGudang) params.status_kode = ['BK-DISETUJUI', 'BK-MENUNGGU', 'BK-SELESAI'];
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
            items: [...formData.items, { kategori_id: '', barang_id: '', jumlah: '' }]
        });
    };

    const removeItemRow = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [qrScanner, setQrScanner] = useState({ isOpen: false, activeIndex: null });

    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;
        const anyOpen = isInputModalOpen || isVerifyModalOpen || qrScanner.isOpen || confirmModal.isOpen;
        mainEl.style.overflowY = anyOpen ? 'hidden' : '';
        return () => { mainEl.style.overflowY = ''; };
    }, [isInputModalOpen, isVerifyModalOpen, qrScanner.isOpen, confirmModal.isOpen]);

    // Inisialisasi alokasi batch default (FEFO) saat Petugas Gudang membuka modal eksekusi
    // untuk bahan berkadaluarsa. Petugas tetap bisa mengubah pilihannya (override).
    useEffect(() => {
        if (!isVerifyModalOpen || !selectedTransaksi || !isPetugasGudang) return;
        if (selectedTransaksi.status_transaksi?.kode !== 'BK-DISETUJUI') return;

        const barang = selectedTransaksi.transaksi?.barang;
        const useFefo = !!barang?.perlu_kadaluarsa;
        if (!useFefo) {
            setBatchSelection({});
            return;
        }

        const jumlah = Number(selectedTransaksi.transaksi?.jumlah ?? 0);
        const batches = (barang?.batch_barang ?? [])
            .filter(b => b.stok_tersisa > 0 && b.status_batch === 'Aktif')
            .sort((a, b) => new Date(a.tgl_kadaluarsa) - new Date(b.tgl_kadaluarsa));

        let remaining = jumlah;
        const sel = {};
        for (const b of batches) {
            if (remaining <= 0) break;
            const take = Math.min(Number(b.stok_tersisa), remaining);
            sel[b.id] = Number(take.toFixed(3));
            remaining = Number((remaining - take).toFixed(3));
        }
        setBatchSelection(sel);
    }, [isVerifyModalOpen, selectedTransaksi, isPetugasGudang]);

    const handleBatchQtyChange = (batchId, value, maxStok) => {
        if (value === '') {
            setBatchSelection(prev => ({ ...prev, [batchId]: '' }));
            return;
        }
        let num = parseFloat(value);
        if (isNaN(num) || num < 0) num = 0;
        if (num > maxStok) {
            num = maxStok;
            toast.error(`Jumlah melebihi sisa stok batch ini (${maxStok}).`);
        }
        setBatchSelection(prev => ({ ...prev, [batchId]: num }));
    };

    const resetBatchToFefo = () => {
        const barang = selectedTransaksi?.transaksi?.barang;
        const jumlah = Number(selectedTransaksi?.transaksi?.jumlah ?? 0);
        const batches = (barang?.batch_barang ?? [])
            .filter(b => b.stok_tersisa > 0 && b.status_batch === 'Aktif')
            .sort((a, b) => new Date(a.tgl_kadaluarsa) - new Date(b.tgl_kadaluarsa));
        let remaining = jumlah;
        const sel = {};
        for (const b of batches) {
            if (remaining <= 0) break;
            const take = Math.min(Number(b.stok_tersisa), remaining);
            sel[b.id] = Number(take.toFixed(3));
            remaining = Number((remaining - take).toFixed(3));
        }
        setBatchSelection(sel);
    };

    const handleScanResult = async (code) => {
        const index = qrScanner.activeIndex;
        if (index === null) return;

        // Show loading toast or something (optional)
        const toastId = toast.loading('Mencari barang dari QR Code...');

        try {
            const response = await axios.get('/api/barang', {
                params: { search: code, per_page: 5 } // API search checks kode_barang as well
            });
            const data = response.data.data || response.data;

            // Find exact match for kode_barang
            const exactMatch = data.find(item => item.kode_barang === code);
            const foundItem = exactMatch || (data.length > 0 ? data[0] : null);

            if (foundItem) {
                const activeBatches = foundItem.batch_barang || [];
                const priorityBatch = activeBatches.length > 0 ? activeBatches[0] : null;

                const opt = {
                    id: foundItem.id,
                    label: `${foundItem.kode_barang} - ${foundItem.nama_barang}`,
                    nama_barang: foundItem.nama_barang,
                    kode_barang: foundItem.kode_barang,
                    total_stok: foundItem.total_stok || 0,
                    satuan: foundItem.satuan?.nama_satuan || 'Unit',
                    kategori: foundItem.kategori?.nama || '-',
                    perlu_kadaluarsa: foundItem.perlu_kadaluarsa,
                    fefoBatch: priorityBatch,
                    allBatches: activeBatches
                };

                handleItemChange(index, 'barang_id', foundItem.id, opt);
                toast.success(`Barang ditemukan: ${foundItem.nama_barang}`, { id: toastId });
            } else {
                toast.error(`Barang dengan kode ${code} tidak ditemukan.`, { id: toastId });
            }
        } catch (error) {
            console.error('Scan error:', error);
            toast.error('Gagal mencari barang hasil scan.', { id: toastId });
        }
    };

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
        if (status === 'Disetujui') {
            if (!selectedPetugasGudang) {
                toast.error('Silakan pilih Petugas Gudang yang akan mengeksekusi pengeluaran ini.');
                return;
            }
            // Cek total stok batch mencukupi
            const jumlah = selectedTransaksi.transaksi?.jumlah ?? 0;
            const totalBatchStok = (selectedTransaksi.transaksi?.barang?.batch_barang ?? [])
                .filter(b => b.stok_tersisa > 0 && b.status_batch === 'Aktif')
                .reduce((sum, b) => sum + b.stok_tersisa, 0);
            if (totalBatchStok < jumlah) {
                toast.error('Stok tidak mencukupi untuk memenuhi jumlah yang diminta.');
                return;
            }
        }
        showConfirm(
            'Konfirmasi Verifikasi',
            `Apakah Anda yakin ingin memberikan status "${status}" pada transaksi ini?`,
            async () => {
                try {
                    const payload = { status };
                    if (status === 'Disetujui') {
                        payload.petugas_gudang_id = selectedPetugasGudang;
                    }
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

    const submitExecute = async (fisik_sesuai) => {
        const barang = selectedTransaksi?.transaksi?.barang;
        const useFefo = !!barang?.perlu_kadaluarsa;
        const jumlah = Number(selectedTransaksi?.transaksi?.jumlah ?? 0);

        let batchAlokasi = null;
        if (fisik_sesuai && useFefo) {
            batchAlokasi = Object.entries(batchSelection)
                .map(([batch_barang_id, jml]) => ({ batch_barang_id: Number(batch_barang_id), jumlah: Number(jml) || 0 }))
                .filter(b => b.jumlah > 0);

            if (batchAlokasi.length === 0) {
                toast.error('Silakan tentukan batch yang akan dikeluarkan.');
                return;
            }
            const total = batchAlokasi.reduce((s, b) => s + b.jumlah, 0);
            if (Math.abs(total - jumlah) > 0.0001) {
                toast.error(`Total batch yang dipilih (${Number(total.toFixed(3))}) harus sama dengan jumlah diminta (${jumlah}).`);
                return;
            }
        }

        const title = fisik_sesuai ? 'Konfirmasi Eksekusi' : 'Laporkan Ketidaksesuaian';
        const message = fisik_sesuai ? 'Apakah Anda yakin telah mengeksekusi/menyiapkan pengeluaran ini secara fisik sesuai dengan permintaan?' : 'Anda yakin ingin melaporkan ketidaksesuaian fisik dan MEMBATALKAN transaksi ini?';

        showConfirm(
            title,
            message,
            async () => {
                try {
                    await axios.put(`/api/pengeluaran/${selectedTransaksi.id}/execute`, {
                        fisik_sesuai: fisik_sesuai,
                        catatan: catatanException,
                        batch_alokasi: batchAlokasi
                    });
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success(fisik_sesuai ? 'Pengeluaran berhasil disiapkan.' : 'Laporan ketidaksesuaian berhasil dikirim.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal mengeksekusi.');
                }
            },
            fisik_sesuai ? 'info' : 'danger'
        );
    };

    const submitConfirm = async (sesuai) => {
        const title = sesuai ? 'Konfirmasi Penerimaan' : 'Laporkan Ketidaksesuaian';
        const message = sesuai ? 'Apakah Anda yakin telah menerima barang ini sesuai dengan Surat Jalan?' : 'Anda yakin ingin melaporkan bahwa barang tidak sesuai dengan Surat Jalan dan MEMBATALKAN transaksi ini?';

        showConfirm(
            title,
            message,
            async () => {
                try {
                    await axios.put(`/api/pengeluaran/${selectedTransaksi.id}/confirm`, {
                        sesuai: sesuai,
                        catatan: catatanException
                    });
                    setIsVerifyModalOpen(false);
                    fetchData();
                    toast.success(sesuai ? 'Penerimaan berhasil dikonfirmasi.' : 'Laporan ketidaksesuaian berhasil dikirim.');
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Gagal mengonfirmasi.');
                }
            },
            sesuai ? 'info' : 'danger'
        );
    };

    const [downloadingIdSJ, setDownloadingIdSJ] = useState(null);

    const downloadSuratJalan = async (id) => {
        setDownloadingIdSJ(id);
        try {
            const response = await axios.get(`/api/pengeluaran/${id}/surat-jalan`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Surat_Jalan_SJ-${String(id).padStart(6, '0')}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading surat jalan:', error);
            toast.error('Gagal mengunduh surat jalan.');
        } finally {
            setDownloadingIdSJ(null);
        }
    };

    const filteredData = transaksiList.filter(t => {
        if (isVerifikasiMode && isKoordinator && t.status_transaksi?.kode !== 'BK-PENDING') return false;
        if (isPetugasGudang) {
            const allowed = isVerifikasiMode
                ? ['BK-DISETUJUI']
                : ['BK-DISETUJUI', 'BK-MENUNGGU', 'BK-SELESAI'];
            if (!allowed.includes(t.status_transaksi?.kode)) return false;
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
            case 'Pending': return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-amber-100 text-amber-700 inline-flex items-start gap-1"><Clock className="w-3 h-3 shrink-0 mt-0.5" /> <span>Menunggu Verifikasi Koordinator</span></span>;
            case 'Disetujui': return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-blue-100 text-blue-700 inline-flex items-start gap-1"><CheckCircle className="w-3 h-3 shrink-0 mt-0.5" /> <span>Menunggu Eksekusi Petugas</span></span>;
            case 'Menunggu Konfirmasi': return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-indigo-100 text-indigo-700 inline-flex items-start gap-1"><Clock className="w-3 h-3 shrink-0 mt-0.5" /> <span>Menunggu Konfirmasi Laboran</span></span>;
            case 'Selesai': return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-start gap-1"><CheckCircle className="w-3 h-3 shrink-0 mt-0.5" /> <span>Selesai</span></span>;
            case 'Ditolak': return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-rose-100 text-rose-700 inline-flex items-start gap-1"><XCircle className="w-3 h-3 shrink-0 mt-0.5" /> <span>Ditolak</span></span>;
            default: return <span className="px-3 py-1 rounded-2xl text-xs font-semibold bg-slate-100 text-slate-700 inline-flex items-start">{status}</span>;
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
                                <th className="px-6 py-4">Kegiatan / Keperluan</th>
                                <th className="px-6 py-4">Ruang Lab</th>
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
                                        <td className="px-6 py-4 text-slate-700">{transaksi.ruang_laboratorium?.nama || '-'}</td>
                                        <td className="px-6 py-4">{getStatusBadge(transaksi.status_transaksi?.nama || 'Pending')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedTransaksi(transaksi);
                                                    setSelectedBatchId('');
                                                    setAlasanOverride('');
                                                    setExceptionMode(false);
                                                    setCatatanException('');
                                                    setIsVerifyModalOpen(true);

                                                    if (isKoordinator && transaksi.status_transaksi?.kode === 'BK-PENDING') {
                                                        const useFefoAuto = !!transaksi.transaksi?.barang?.perlu_kadaluarsa;
                                                        const activeB = transaksi.transaksi?.barang?.batch_barang
                                                            ?.filter(b => b.stok_tersisa > 0 && b.status_batch === 'Aktif')
                                                            ?.sort((a, b) => useFefoAuto
                                                                ? new Date(a.tgl_kadaluarsa) - new Date(b.tgl_kadaluarsa)
                                                                : new Date(a.tgl_penerimaan) - new Date(b.tgl_penerimaan)
                                                            );
                                                        if (activeB && activeB.length > 0) {
                                                            setSelectedBatchId(activeB[0].id);
                                                        }
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat Detail / Verifikasi"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {(isLaboran || isPetugasGudang) && ['BK-MENUNGGU', 'BK-SELESAI'].includes(transaksi.status_transaksi?.kode) && (
                                                <button
                                                    onClick={() => downloadSuratJalan(transaksi.id)}
                                                    disabled={downloadingIdSJ === transaksi.id}
                                                    className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg transition-colors ml-1 disabled:opacity-50"
                                                    title="Download Surat Jalan"
                                                >
                                                    {downloadingIdSJ === transaksi.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-[#0266a2]" />
                                                    ) : (
                                                        <Download className="w-5 h-5" />
                                                    )}
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
            <AnimatePresence>
                {isInputModalOpen && isLaboran && (
                    <div className="fixed inset-0 z-50">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"></div>
                        <div className="fixed inset-0 overflow-y-auto" onClick={() => setIsInputModalOpen(false)}>
                            <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 sm:my-10"
                                    onClick={e => e.stopPropagation()}
                                >
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
                                                        {/* Barang Autocomplete */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Cari Barang / Scan Barcode</label>
                                                            <BarangAutocomplete
                                                                value={item.barang_id}
                                                                onChange={(val, opt) => handleItemChange(index, 'barang_id', val, opt)}
                                                                onScanClick={() => setQrScanner({ isOpen: true, activeIndex: index })}
                                                                placeholder="Ketik nama atau scan barcode..."
                                                            />
                                                            {item.barangData && (
                                                                <div className="mt-2 space-y-1">
                                                                    <p className="text-xs text-[#0266a2] font-medium flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Stok Total: {item.barangData.total_stok} {item.barangData.satuan}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Jumlah Input */}
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                                Jumlah
                                                                {item.barangData && (
                                                                    <span className="ml-2 font-normal text-slate-400">
                                                                        ({item.barangData.satuan_is_desimal ? 'desimal diizinkan' : 'bilangan bulat'})
                                                                    </span>
                                                                )}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                required
                                                                min={item.barangData?.satuan_is_desimal ? "0.001" : "1"}
                                                                step={item.barangData?.satuan_is_desimal ? "0.001" : "1"}
                                                                value={item.jumlah}
                                                                onChange={(e) => handleItemChange(index, 'jumlah', e.target.value)}
                                                                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0266a2]"
                                                                placeholder="Masukkan jumlah..."
                                                            />
                                                        </div>
                                                    </div>
                                                    {formData.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemRow(index)}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-6"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
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
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Verify/Detail Modal */}
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
                                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8 sm:my-10"
                                        onClick={e => e.stopPropagation()}
                                    >
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
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
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

                                            {/* Pemilihan Batch oleh Petugas Gudang saat eksekusi */}
                                            {isPetugasGudang && selectedTransaksi.status_transaksi?.kode === 'BK-DISETUJUI' && !exceptionMode && (() => {
                                                const barang = selectedTransaksi.transaksi?.barang;
                                                const useFefo = !!barang?.perlu_kadaluarsa;
                                                const jumlahDiminta = Number(selectedTransaksi.transaksi?.jumlah ?? 0);
                                                const satuan = barang?.satuan?.singkatan || '';

                                                if (!useFefo) {
                                                    return (
                                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-2">
                                                            <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                            <p className="text-sm text-slate-600">
                                                                Barang ini <span className="font-semibold">tidak memerlukan pemilihan batch</span> (tanpa FEFO/FIFO). Stok akan dipotong otomatis dari total saat Anda menekan <span className="font-semibold">Eksekusi Sesuai</span>.
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                const batches = (barang?.batch_barang ?? [])
                                                    .filter(b => b.stok_tersisa > 0 && b.status_batch === 'Aktif')
                                                    .sort((a, b) => new Date(a.tgl_kadaluarsa) - new Date(b.tgl_kadaluarsa));

                                                const totalDipilih = Object.values(batchSelection).reduce((s, v) => s + (Number(v) || 0), 0);
                                                const sisa = Number((jumlahDiminta - totalDipilih).toFixed(3));
                                                const cocok = Math.abs(sisa) < 0.0001;

                                                return (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                                Pilih Batch yang Dikeluarkan
                                                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">FEFO</span>
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                onClick={resetBatchToFefo}
                                                                className="text-xs font-semibold text-[#0266a2] hover:underline"
                                                            >
                                                                Set ulang ke FEFO
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mb-3">
                                                            Saran sistem mengikuti FEFO (kadaluarsa terdekat didahulukan). Anda dapat menyesuaikan jumlah per batch selama totalnya sama dengan jumlah diminta.
                                                        </p>

                                                        <div className="space-y-2">
                                                            {batches.length === 0 ? (
                                                                <p className="text-sm text-slate-400 text-center py-3 italic border border-slate-200 rounded-xl bg-slate-50">Tidak ada batch aktif tersedia</p>
                                                            ) : batches.map((batch, idx) => {
                                                                const selected = Number(batchSelection[batch.id]) > 0;
                                                                return (
                                                                    <div key={batch.id} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border ${selected ? 'border-[#0266a2]/40 bg-blue-50/40' : 'border-slate-200 bg-white'}`}>
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            {idx === 0 && <span className="text-amber-400 text-xs font-bold shrink-0" title="Prioritas FEFO">★</span>}
                                                                            <div className="min-w-0">
                                                                                <p className="text-sm font-medium text-slate-800 truncate">{batch.kode_batch}</p>
                                                                                <p className="text-xs text-slate-400">
                                                                                    Exp: {batch.tgl_kadaluarsa ? formatDate(batch.tgl_kadaluarsa) : '-'} · Sisa: {batch.stok_tersisa} {satuan}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max={batch.stok_tersisa}
                                                                                step={barang?.satuan?.is_desimal ? '0.001' : '1'}
                                                                                value={batchSelection[batch.id] ?? ''}
                                                                                onChange={(e) => handleBatchQtyChange(batch.id, e.target.value, Number(batch.stok_tersisa))}
                                                                                placeholder="0"
                                                                                className="w-24 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-[#0266a2]"
                                                                            />
                                                                            <span className="text-xs text-slate-400 w-8">{satuan}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className={`mt-3 flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${cocok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                            <span className="font-medium">Total dipilih: {Number(totalDipilih.toFixed(3))} / {jumlahDiminta} {satuan}</span>
                                                            {cocok ? (
                                                                <span className="flex items-center gap-1 font-semibold"><CheckCircle className="w-4 h-4" /> Sesuai</span>
                                                            ) : (
                                                                <span className="font-semibold">{sisa > 0 ? `Kurang ${sisa} ${satuan}` : `Lebih ${Math.abs(sisa)} ${satuan}`}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

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
                                            {selectedTransaksi.status_transaksi?.nama === 'Pending' && isKoordinator && (() => {
                                                const useFefoModal = !!selectedTransaksi.transaksi?.barang?.perlu_kadaluarsa;
                                                const jumlahDiminta = Number(selectedTransaksi.transaksi?.jumlah ?? 0);
                                                const totalStok = Number(selectedTransaksi.transaksi?.barang?.total_stok ?? 0);
                                                const satuan = selectedTransaksi.transaksi?.barang?.satuan?.singkatan || '';
                                                const bisaDipenuhi = totalStok >= jumlahDiminta;

                                                return (
                                                    <div className="pt-6 border-t border-slate-100 space-y-4">
                                                        {/* Ringkasan ketersediaan stok */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-sm font-semibold text-slate-700">
                                                                    Ketersediaan Stok - <span className="text-[#0266a2]">{selectedTransaksi.transaksi?.barang?.nama_barang || 'Barang'}</span>
                                                                </label>
                                                                {bisaDipenuhi ? (
                                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" /> Stok Cukup
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-200 flex items-center gap-1">
                                                                        <XCircle className="w-3 h-3" /> Stok Tidak Cukup
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">Diminta: <span className="font-bold text-slate-800">{jumlahDiminta} {satuan}</span></span>
                                                                <span className="text-slate-600">Stok Tersedia: <span className="font-bold text-slate-800">{totalStok} {satuan}</span></span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-2">
                                                                {useFefoModal
                                                                    ? 'Barang berkadaluarsa: pemilihan batch (FEFO) akan dilakukan oleh Petugas Gudang saat eksekusi.'
                                                                    : 'Barang non-kadaluarsa: stok dipotong otomatis dari total saat dieksekusi Petugas Gudang.'}
                                                            </p>
                                                            {!bisaDipenuhi && (
                                                                <div className="mt-2 px-3 py-2 bg-rose-50 rounded-lg border border-rose-100">
                                                                    <p className="text-xs text-rose-600 font-medium">Kekurangan {Number((jumlahDiminta - totalStok).toFixed(3))} {satuan} — permintaan tidak dapat dipenuhi.</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Tugaskan Petugas */}
                                                        <div>
                                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tugaskan Petugas Gudang <span className="text-rose-500">*</span></label>
                                                            <SearchableSelect
                                                                value={selectedPetugasGudang}
                                                                onChange={(e) => setSelectedPetugasGudang(e.target.value)}
                                                                options={petugasGudangOptions.map(p => ({ value: p.id, label: `${p.laboran?.user?.name} - ${p.kategori_rumpun?.nama_rumpun}` }))}
                                                                placeholder="-- Pilih Petugas Gudang --"
                                                            />
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
                                                                disabled={!selectedPetugasGudang || !bisaDipenuhi}
                                                                className={"px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl flex items-center gap-2 shadow-sm" + (!selectedPetugasGudang || !bisaDipenuhi ? ' opacity-50 cursor-not-allowed' : '')}
                                                            >
                                                                <CheckCircle className="w-4 h-4" /> Setujui
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}



                                        </div>

                                        {/* Bottom Bar: Action Buttons & Tutup */}
                                        {!(isKoordinator && selectedTransaksi.status_transaksi?.nama === 'Pending') && (
                                            <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row justify-end items-center gap-4">

                                                {isPetugasGudang && selectedTransaksi.status_transaksi?.kode === 'BK-DISETUJUI' && !exceptionMode && (
                                                    <div className="flex w-full flex-col sm:flex-row gap-2">
                                                        {/* Surat Jalan belum tersedia di sini; baru muncul setelah
                                                            pengeluaran fisik (klik "Eksekusi Sesuai" -> BK-MENUNGGU). */}
                                                        <button
                                                            onClick={() => setExceptionMode(true)}
                                                            className="px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none transition-all"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Batalkan
                                                        </button>
                                                        {(() => {
                                                            const useFefo = !!selectedTransaksi.transaksi?.barang?.perlu_kadaluarsa;
                                                            const jumlahDiminta = Number(selectedTransaksi.transaksi?.jumlah ?? 0);
                                                            const totalDipilih = Object.values(batchSelection).reduce((s, v) => s + (Number(v) || 0), 0);
                                                            const fefoBelumPas = useFefo && Math.abs(totalDipilih - jumlahDiminta) > 0.0001;
                                                            return (
                                                                <button
                                                                    onClick={() => submitExecute(true)}
                                                                    disabled={fefoBelumPas}
                                                                    className={"px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none transition-all" + (fefoBelumPas ? ' opacity-50 cursor-not-allowed' : '')}
                                                                    title={fefoBelumPas ? 'Total batch yang dipilih harus sama dengan jumlah diminta' : ''}
                                                                >
                                                                    <PackageMinus className="w-4 h-4" /> Eksekusi Pengeluaran
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                )}

                                                {isPetugasGudang && selectedTransaksi.status_transaksi?.kode === 'BK-DISETUJUI' && exceptionMode && (
                                                    <div className="w-full text-left">
                                                        <label className="block text-sm font-semibold text-rose-700 mb-1.5 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" /> Catatan Ketidaksesuaian Fisik (Wajib)
                                                        </label>
                                                        <textarea
                                                            value={catatanException}
                                                            onChange={(e) => setCatatanException(e.target.value)}
                                                            placeholder="Jelaskan ketidaksesuaian fisik (misal: barang rusak, jumlah kurang, dsb)..."
                                                            className="w-full px-4 py-2 border border-rose-300 bg-rose-50 rounded-xl text-sm focus:outline-none focus:border-rose-500 mb-3"
                                                            rows="2"
                                                        ></textarea>
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setExceptionMode(false)}
                                                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={() => submitExecute(false)}
                                                                disabled={!catatanException.trim()}
                                                                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Laporkan & Batalkan Transaksi
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedTransaksi.status_transaksi?.kode === 'BK-MENUNGGU' && isLaboran && selectedTransaksi.created_by === user?.id && !exceptionMode && (
                                                    <div className="flex w-full flex-col sm:flex-row gap-2">
                                                        <button
                                                            onClick={() => downloadSuratJalan(selectedTransaksi.id)}
                                                            disabled={downloadingIdSJ === selectedTransaksi.id}
                                                            className="px-5 py-2.5 text-sm font-semibold text-[#0266a2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center gap-2 flex-1 sm:flex-none transition-all disabled:opacity-70"
                                                        >
                                                            {downloadingIdSJ === selectedTransaksi.id ? (
                                                                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                                                            ) : (
                                                                <><FileText className="w-4 h-4" /> Cetak Surat Jalan</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setExceptionMode(true)}
                                                            className="px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none transition-all"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Tidak Sesuai Surat Jalan
                                                        </button>
                                                        <button
                                                            onClick={() => submitConfirm(true)}
                                                            className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-none transition-all"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Konfirmasi Diterima Sesuai
                                                        </button>
                                                    </div>
                                                )}

                                                {selectedTransaksi.status_transaksi?.kode === 'BK-MENUNGGU' && isLaboran && selectedTransaksi.created_by === user?.id && exceptionMode && (
                                                    <div className="w-full text-left">
                                                        <label className="block text-sm font-semibold text-rose-700 mb-1.5 flex items-center gap-1">
                                                            <AlertCircle className="w-4 h-4" /> Catatan Barang Tidak Sesuai (Wajib)
                                                        </label>
                                                        <textarea
                                                            value={catatanException}
                                                            onChange={(e) => setCatatanException(e.target.value)}
                                                            placeholder="Jelaskan ketidaksesuaian barang dengan surat jalan..."
                                                            className="w-full px-4 py-2 border border-rose-300 bg-rose-50 rounded-xl text-sm focus:outline-none focus:border-rose-500 mb-3"
                                                            rows="2"
                                                        ></textarea>
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setExceptionMode(false)}
                                                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={() => submitConfirm(false)}
                                                                disabled={!catatanException.trim()}
                                                                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Laporkan & Batalkan Transaksi
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {!exceptionMode && (
                                                    <button onClick={() => setIsVerifyModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm w-full sm:w-auto justify-center">Tutup</button>
                                                )}
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

                    <QRScannerModal
                        isOpen={qrScanner.isOpen}
                        onClose={() => setQrScanner({ ...qrScanner, isOpen: false })}
                        onScan={handleScanResult}
                    />
                </div>
                );
};

                export default PengeluaranBarang;
