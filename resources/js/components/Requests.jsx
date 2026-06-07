import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const Requests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status.toLowerCase()) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const counts = {
        All: requests.length,
        Pending: requests.filter(r => r.status.toLowerCase() === 'pending').length,
        Approved: requests.filter(r => r.status.toLowerCase() === 'approved').length,
        Rejected: requests.filter(r => r.status.toLowerCase() === 'rejected').length,
    };

    const filteredRequests = filter === 'All' 
        ? requests 
        : requests.filter(r => r.status.toLowerCase() === filter.toLowerCase());

    const totalData = filteredRequests.length;
    const totalPages = Math.ceil(totalData / perPage);
    const paginatedData = filteredRequests.slice((page - 1) * perPage, page * perPage);

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0266a2]"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">Material Requests</h1>
                <p className="text-slate-500 mt-1">View and manage all material requests</p>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex items-center gap-2 overflow-x-auto">
                {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            filter === tab 
                            ? 'bg-[#0266a2] text-white shadow-md shadow-blue-900/10' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {tab} 
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            filter === tab ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                        }`}>
                            {counts[tab]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
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
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-[#0266a2]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">{counts[filter]} Requests</h2>
                        </div>
                    </div>
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
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-slate-500">
                                        No requests found for this status.
                                    </td>
                                </tr>
                            ) : paginatedData.map((req, idx) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 text-slate-800 font-medium">{(page - 1) * perPage + idx + 1}</td>
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
        </div>
    );
};

export default Requests;
