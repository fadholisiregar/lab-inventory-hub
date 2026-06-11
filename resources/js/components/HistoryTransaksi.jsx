import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History, Search, Eye, FileText, CheckCircle, XCircle, PackageMinus } from 'lucide-react';
import axios from '../lib/axios';
import { formatDate } from '../utils/dateFormatter';

const HistoryTransaksi = () => {
    const { jenis } = useParams();
    const navigate = useNavigate();
    
    const [transaksiList, setTransaksiList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    
    const filterJenis = jenis === 'masuk' ? 'masuk' : 'keluar';
    
    const [selectedTransaksi, setSelectedTransaksi] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filterJenis]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const activeRole = localStorage.getItem('activeRole') || '';
            const isKoordinator = activeRole === 'Koordinator Gudang' || activeRole === 'Koordinator';
            const isPetugasGudang = activeRole === 'Petugas Gudang';

            let params = {};
            if (isKoordinator) {
                params.status_kode_not = filterJenis === 'masuk' ? 'BM-PENDING' : 'BK-PENDING';
            } else if (isPetugasGudang) {
                params.status_kode_not = filterJenis === 'masuk' ? 'BM-PENDING' : ['BK-PENDING', 'BK-DISETUJUI'];
            }

            const endpoint = filterJenis === 'masuk' ? '/api/penerimaan' : '/api/pengeluaran';
            const response = await axios.get(endpoint, { params });
            setTransaksiList(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setIsLoading(false);
        }
    };

    const activeRole = localStorage.getItem('activeRole') || '';
    const isLaboran = activeRole === 'Laboran';

    const filteredData = transaksiList.filter(t => {
        const search = searchTerm.toLowerCase();
        let matchesSearch = false;

        if (filterJenis === 'masuk') {
            const creator = (t.creator?.name || '').toLowerCase();
            const petugas = (t.transaksi?.dieksekusi_oleh_user?.name || '').toLowerCase(); // Note: adjust based on actual relation
            matchesSearch = creator.includes(search) || petugas.includes(search);
        } else {
            const keperluan = (t.transaksi?.keperluan || t.jenis_kegiatan || '').toLowerCase();
            const pengaju = (t.transaksi?.pengaju?.name || t.creator?.name || '').toLowerCase();
            const penyetuju = (t.transaksi?.disetujui_oleh_user?.name || '').toLowerCase();
            matchesSearch = keperluan.includes(search) || pengaju.includes(search) || penyetuju.includes(search);
        }
             
        if (isLaboran) {
            return matchesSearch;
        }
        return matchesSearch && t.status_transaksi?.kode !== 'BK-PENDING' && t.status_transaksi?.kode !== 'BM-PENDING';
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
        if (status === 'Disetujui') return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Disetujui</span>;
        if (status === 'Ditolak') return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Ditolak</span>;
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    };

    const getJenisBadge = (jenis) => {
        if (jenis === 'Masuk') return <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">MASUK</span>;
        if (jenis === 'Keluar') return <span className="px-2 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">KELUAR</span>;
        return <span className="px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">{jenis}</span>;
    }


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-7 h-7 text-[#0266a2]" />
                        {jenis === 'masuk' ? 'Riwayat Barang Masuk' : (jenis === 'keluar' ? 'Riwayat Barang Keluar' : 'Riwayat Transaksi')}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Laporan historis seluruh transaksi {jenis === 'masuk' ? 'barang masuk' : (jenis === 'keluar' ? 'barang keluar' : 'barang masuk dan keluar')}.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto flex-1">
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
                        <div className="relative flex-1 w-full max-w-md">
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
                    {!jenis && (
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                            {['Semua', 'Masuk', 'Keluar'].map(jns => (
                                <button
                                    key={jns}
                                    onClick={() => {
                                        const pathSuffix = jns === 'Masuk' ? 'masuk' : (jns === 'Keluar' ? 'keluar' : '');
                                        navigate(`/history${pathSuffix ? '/' + pathSuffix : ''}`);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${filterJenis === jns ? 'bg-[#0266a2] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {jns}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Waktu Selesai</th>
                                {filterJenis === 'keluar' && <th className="px-6 py-4">Pengaju</th>}
                                {filterJenis === 'keluar' && <th className="px-6 py-4">Kegiatan / Keperluan</th>}
                                {filterJenis === 'keluar' && <th className="px-6 py-4">Ruang Lab</th>}
                                {filterJenis === 'masuk' && <th className="px-6 py-4">Petugas</th>}
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={filterJenis === 'keluar' ? 6 : 4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-[#0266a2]/20 border-t-[#0266a2] rounded-full animate-spin"></div>
                                            Memuat riwayat...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={filterJenis === 'keluar' ? 6 : 4} className="px-6 py-12 text-center text-slate-500">
                                        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-base font-medium text-slate-900">Belum ada riwayat transaksi</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map(transaksi => (
                                    <tr key={transaksi.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(transaksi.updated_at)}</td>
                                        {filterJenis === 'keluar' && (
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{transaksi.transaksi?.pengaju?.name || transaksi.creator?.name || '-'}</div>
                                            </td>
                                        )}
                                        {filterJenis === 'keluar' && (
                                            <td className="px-6 py-4 text-slate-600">{transaksi.judul_kegiatan || transaksi.transaksi?.keperluan || '-'}</td>
                                        )}
                                        {filterJenis === 'keluar' && (
                                            <td className="px-6 py-4 text-slate-700">{transaksi.ruang_laboratorium?.nama || '-'}</td>
                                        )}
                                        {filterJenis === 'masuk' && <td className="px-6 py-4 text-slate-700">{transaksi.creator?.name || '-'}</td>}
                                        <td className="px-6 py-4">{getStatusBadge(transaksi.status_transaksi?.nama || 'Unknown')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedTransaksi(transaksi);
                                                    setIsDetailModalOpen(true);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-[#0266a2] hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye className="w-5 h-5" />
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

            {/* Detail Modal */}
            {isDetailModalOpen && selectedTransaksi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0266a2]" />
                                Dokumen Transaksi {selectedTransaksi.jenis}
                            </h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Status Final</span>
                                    {getStatusBadge(selectedTransaksi.status_transaksi?.nama || 'Unknown')}
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Tanggal & Waktu</span>
                                    <div className="font-semibold text-slate-800">{formatDate(selectedTransaksi.updated_at)}</div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">{filterJenis === 'keluar' ? 'Keperluan' : 'Jenis Kegiatan'}</span>
                                    <div className="font-semibold text-slate-800">{filterJenis === 'keluar' ? (selectedTransaksi.judul_kegiatan || selectedTransaksi.transaksi?.keperluan || '-') : (selectedTransaksi.jenis_kegiatan || '-')}</div>
                                </div>
                                <div>
                                    <span className="block text-slate-500 font-medium mb-1">Eksekutor</span>
                                    <div className="font-semibold text-slate-800">{selectedTransaksi.transaksi?.dieksekusiOleh?.name || '-'}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-3">Rincian Item</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Nama Barang</th>
                                                <th className="px-4 py-3">Jumlah Mutasi</th>
                                                <th className="px-4 py-3 text-right">Stok Sesudah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-slate-800">
                                                    {selectedTransaksi.transaksi?.barang?.nama_barang}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-[#0266a2]">
                                                    {filterJenis === 'masuk' ? '+' : '-'}{selectedTransaksi.transaksi?.jumlah} {selectedTransaksi.transaksi?.barang?.satuan?.singkatan}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600">
                                                    {selectedTransaksi.transaksi?.stok_sesudah} {selectedTransaksi.transaksi?.barang?.satuan?.singkatan}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Riwayat Verifikasi */}
                            {filterJenis === 'keluar' && (
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
                                                <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.pengaju?.name || selectedTransaksi.transaksi?.pengaju?.name} (Laboran)</div>
                                            </div>
                                        </div>

                                        {selectedTransaksi.status_transaksi?.nama !== 'Pending' && selectedTransaksi.status_transaksi?.kode !== 'BK-PENDING' && (
                                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                                    {selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className={`font-bold text-sm ${selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'text-rose-700' : 'text-blue-700'}`}>
                                                            {selectedTransaksi.status_transaksi?.nama === 'Ditolak' ? 'Ditolak' : 'Disetujui'}
                                                        </div>
                                                        <div className="text-xs font-medium text-slate-500">{selectedTransaksi.transaksi?.disetujui_oleh ? formatDate(selectedTransaksi.transaksi?.updated_at) : ''}</div>
                                                    </div>
                                                    <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.penyetuju?.name || selectedTransaksi.transaksi?.disetujuiOleh?.name || 'Koordinator'}</div>
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
                                                    <div className="text-sm text-slate-600">Oleh: {selectedTransaksi.eksekutor?.name || selectedTransaksi.transaksi?.dieksekusiOleh?.name || 'Petugas Gudang'}</div>
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
                                                    <div className="text-sm text-slate-600">Diterima oleh: {selectedTransaksi.pengaju?.name || selectedTransaksi.transaksi?.pengaju?.name}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryTransaksi;
