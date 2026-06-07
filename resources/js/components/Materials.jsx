import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Search, Filter, TrendingDown } from 'lucide-react';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await axios.get('/api/materials');
            setMaterials(response.data);
        } catch (error) {
            console.error('Error fetching materials', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m => 
        m.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.kode_barang.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl font-semibold text-slate-800">Material Inventory</h1>
                <p className="text-slate-500 mt-1">Manage and monitor laboratory materials</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                        type="text"
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center p-3 text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="h-10 border-l border-slate-200 hidden sm:block"></div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                        Total: {filteredMaterials.length}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <Box className="w-4 h-4" />
                {filteredMaterials.length} materials found
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.map((item) => {
                    // Calculate percentage (maxed at 100)
                    const percent = Math.min(100, Math.round((item.current_stock / Math.max(item.stok_minimum * 2, 1)) * 100));
                    const isLowStock = item.status === 'Low Stock';

                    return (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${isLowStock ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        <Box className="w-6 h-6" />
                                    </div>
                                    <span className="bg-blue-50 text-[#0266a2] text-xs font-semibold px-2.5 py-1 rounded-md">
                                        {item.kategori}
                                    </span>
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-lg mb-1">{item.nama_barang}</h3>
                                    <p className="text-xs text-slate-400 font-mono">{item.kode_barang}</p>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Current Stock</span>
                                        <span className="font-semibold text-slate-800">{item.current_stock} {item.satuan}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Minimum Stock</span>
                                        <span className="font-medium text-slate-600">{item.stok_minimum} {item.satuan}</span>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isLowStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 text-xs font-medium">
                                        {isLowStock ? (
                                            <span className="text-rose-600 flex items-center gap-1">
                                                <TrendingDown className="w-3 h-3" />
                                                {(item.current_stock / item.stok_minimum * 100).toFixed(0)}%
                                            </span>
                                        ) : (
                                            <span className="text-emerald-600 flex items-center gap-1">
                                                <TrendingDown className="w-3 h-3 transform rotate-180" />
                                                {(item.current_stock / item.stok_minimum * 100).toFixed(0)}%
                                            </span>
                                        )}
                                        <span className={isLowStock ? 'text-rose-600' : 'text-slate-500'}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {filteredMaterials.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">No materials found.</p>
                </div>
            )}
        </div>
    );
};

export default Materials;
