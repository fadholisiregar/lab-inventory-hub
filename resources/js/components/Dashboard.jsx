import React from 'react';
import { AlertTriangle, TrendingDown, FileText, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const { user } = useAuth();
    const roles = user?.roles || [];
    const isAdmin = roles.includes('Admin Gudang') || roles.includes('Koordinator Gudang');
    const isKalab = roles.includes('Kepala Laboratorium Jurusan');
    
    if (roles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
                <div className="bg-amber-50 text-amber-600 p-6 rounded-full mb-6">
                    <Shield className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Menunggu Verifikasi</h2>
                <p className="text-slate-500 max-w-lg text-lg">
                    Akun Anda sedang dalam proses peninjauan. Anda akan dapat mengakses sistem ini setelah Koordinator Gudang memverifikasi dan memberikan hak akses kepada Anda.
                </p>
            </div>
        );
    }

    // Mock Data based on the provided image
    const recentRequests = [
        { no: 1, date: '2025-11-18', requester: 'Dr. Sarah Ahmad', unit: 'Chemistry Lab', material: 'Sodium Chloride', qty: '500g', status: 'Approved' },
        { no: 2, date: '2025-11-18', requester: 'Prof. Budi Santoso', unit: 'Biology Lab', material: 'Test Tubes', qty: '50 pcs', status: 'Pending' },
        { no: 3, date: '2025-11-17', requester: 'Ahmad Fauzi', unit: 'Physics Lab', material: 'Distilled Water', qty: '10L', status: 'Approved' },
        { no: 4, date: '2025-11-17', requester: 'Siti Nurhaliza', unit: 'Chemistry Lab', material: 'Beakers 250ml', qty: '20 pcs', status: 'Rejected' },
        { no: 5, date: '2025-11-16', requester: 'Andi Wijaya', unit: 'Biology Lab', material: 'Petri Dishes', qty: '100 pcs', status: 'Approved' },
    ];

    const lowStockItems = [
        { id: 1, name: 'Sodium Hydroxide', current: 12, max: 50, unit: 'kg', percent: 24 },
        { id: 2, name: 'Pipettes 10ml', current: 8, max: 30, unit: 'pcs', percent: 27 },
        { id: 3, name: 'Lab Gloves', current: 45, max: 100, unit: 'boxes', percent: 45 },
        { id: 4, name: 'Ethanol 96%', current: 3, max: 15, unit: 'L', percent: 20 },
        { id: 5, name: 'Filter Paper', current: 25, max: 100, unit: 'pcs', percent: 25 },
    ];

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            
            {isAdmin && (
                <>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800">Dashboard Admin</h1>
                        <p className="text-slate-500 mt-1">Ringkasan sistem dan persetujuan yang tertunda</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Total Requests */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Permintaan</p>
                                    <h3 className="text-3xl font-bold text-slate-800">248</h3>
                                </div>
                                <div className="p-3 bg-blue-50 text-[#0266a2] rounded-xl">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 mt-4">+12% bulan lalu</p>
                        </div>

                        {/* Approved */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Disetujui</p>
                                    <h3 className="text-3xl font-bold text-slate-800">186</h3>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 mt-4">+8% bulan lalu</p>
                        </div>

                        {/* Pending */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Tertunda (Pending)</p>
                                    <h3 className="text-3xl font-bold text-slate-800">42</h3>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 mt-4">+5% bulan lalu</p>
                        </div>

                        {/* Low Stock */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Stok Menipis</p>
                                    <h3 className="text-3xl font-bold text-slate-800">15</h3>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 mt-4">+3 dari bulan lalu</p>
                        </div>
                    </div>
                </>
            )}

            <div className="flex flex-col xl:flex-row gap-6 flex-1">
            
            {/* Left Side: Recent Requests Table */}
            {!isKalab && (
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800">Recent Requests</h2>
                        <p className="text-sm text-slate-500 mt-1">Latest material requests from all departments</p>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">No</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Date</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Requester</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Unit</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Material</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Quantity</th>
                                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {recentRequests.map((req) => (
                                    <tr key={req.no} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6 text-slate-800 font-medium">{req.no}</td>
                                        <td className="py-4 px-6 text-[#0266a2]">{req.date}</td>
                                        <td className="py-4 px-6 text-slate-700 font-medium whitespace-nowrap">{req.requester}</td>
                                        <td className="py-4 px-6 text-[#0266a2]">{req.unit}</td>
                                        <td className="py-4 px-6 text-slate-700">{req.material}</td>
                                        <td className="py-4 px-6 text-[#0266a2]">{req.qty}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Right Side: Low Stock Warning */}
            <div className="w-full xl:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-rose-600 mb-1">
                        <AlertTriangle className="w-5 h-5" />
                        <h2 className="text-lg font-semibold text-slate-800">Low Stock Warning</h2>
                    </div>
                    <p className="text-sm text-slate-500">Materials below minimum stock level</p>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {lowStockItems.map((item) => (
                        <div key={item.id} className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.current} {item.unit} of {item.max} {item.unit}</p>
                                </div>
                                <div className="flex items-center gap-1 text-rose-600 font-medium text-sm">
                                    <TrendingDown className="w-4 h-4" />
                                    {item.percent}%
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-rose-500 rounded-full" 
                                    style={{ width: `${item.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100">
                    <button className="w-full py-2.5 bg-[#0266a2] hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                        View All Stock
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Dashboard;
