import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStockDetails } from '../store/slices/inventorySlice';
import { Package, AlertTriangle, CheckCircle2, Clock, MapPin, Archive } from 'lucide-react';

const StockDetail = () => {
    const dispatch = useDispatch();
    const { master_barang, batch_barang, total_stok, status, error } = useSelector((state) => state.inventory);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchStockDetails());
        }
    }, [status, dispatch]);

    // Check for FEFO warning (< 120 days)
    const expiringBatches = useMemo(() => {
        if (!batch_barang) return [];
        const now = Date.now();
        return batch_barang.filter(batch => {
            if (!batch.tgl_kadaluarsa) return false;
            const expiryDate = Date.parse(batch.tgl_kadaluarsa);
            const daysLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
            return daysLeft < 120;
        });
    }, [batch_barang]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                <p>Error loading data: {error}</p>
            </div>
        );
    }

    if (!master_barang) return null;

    const isStockLow = total_stok < master_barang.stok_minimum;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Top Section: Master Data Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{master_barang.nama_barang}</h2>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                {master_barang.kode_barang}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                            <div className="flex items-center gap-1.5">
                                <Archive className="w-4 h-4 text-emerald-400" />
                                <span>{master_barang.kategori}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span>{master_barang.lokasi_default}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-row gap-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 w-full md:w-auto">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm mb-1">Total Stok</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{total_stok}</span>
                                <span className="text-gray-500 text-sm">{master_barang.satuan}</span>
                            </div>
                        </div>
                        <div className="w-px bg-gray-700 self-stretch"></div>
                        <div className="flex flex-col justify-between">
                            <span className="text-gray-400 text-sm mb-1">Stok Minimum</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-semibold text-gray-300">{master_barang.stok_minimum}</span>
                                {isStockLow ? (
                                    <span className="flex items-center gap-1 text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">
                                        <AlertTriangle className="w-3 h-3" /> Kurang
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                                        <CheckCircle2 className="w-3 h-3" /> Aman
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning Alert if FEFO needed */}
            {expiringBatches.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-4 items-start shadow-lg shadow-amber-500/5 backdrop-blur-sm">
                    <div className="bg-amber-500/20 p-2 rounded-full mt-0.5">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-amber-400 font-semibold mb-1">Perhatian: Batch Mendekati Kadaluarsa</h3>
                        <p className="text-amber-200/80 text-sm leading-relaxed">
                            Terdapat {expiringBatches.length} batch yang akan kadaluarsa dalam waktu kurang dari 120 hari. 
                            Mohon prioritaskan penggunaan batch tersebut sesuai dengan sistem <strong>FEFO (First Expired First Out)</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* Bottom Section: Batches Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-gray-800 bg-gray-900/80 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-white">Daftar Batch / Lot</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium">Kode Batch</th>
                                <th className="p-4 font-medium">Tgl Masuk</th>
                                <th className="p-4 font-medium">Kadaluarsa</th>
                                <th className="p-4 font-medium">Stok Sisa</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm">
                            {batch_barang.map((batch) => {
                                const isExpiring = expiringBatches.some(b => b.id === batch.id);
                                return (
                                    <tr key={batch.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="p-4">
                                            <span className="font-medium text-gray-200">{batch.kode_batch}</span>
                                        </td>
                                        <td className="p-4 text-gray-400">{batch.tgl_penerimaan}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className={`w-3.5 h-3.5 ${isExpiring ? 'text-amber-400' : 'text-gray-500'}`} />
                                                <span className={isExpiring ? 'text-amber-400 font-medium' : 'text-gray-300'}>
                                                    {batch.tgl_kadaluarsa || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white font-medium">{batch.stok_tersisa}</span>
                                            <span className="text-gray-500 ml-1">{master_barang.satuan}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${batch.status_batch === 'Aktif' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {batch.status_batch}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {batch_barang.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            Tidak ada batch tersedia untuk barang ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
