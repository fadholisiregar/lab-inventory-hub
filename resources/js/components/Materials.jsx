import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Search, Filter, TrendingDown, ChevronDown, X } from 'lucide-react';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [totalData, setTotalData] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const categoryRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/kategori_barang', { params: { all: 1 } });
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMaterials();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, page, perPage, selectedCategory]);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/materials', {
                params: {
                    search: searchTerm,
                    kategori_id: selectedCategory || null,
                    page: page,
                    per_page: perPage
                }
            });
            setMaterials(response.data.data || []);
            setTotalData(response.data.total || 0);
            setTotalPages(response.data.last_page || 0);
        } catch (error) {
            console.error('Error fetching materials', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const filteredCategoriesList = categories.filter(c => 
        c.nama.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Removed early return for isLoading to allow skeleton loading while keeping search bar visible

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
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto" ref={categoryRef}>
                        <div 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 cursor-pointer flex items-center justify-between min-w-[220px] hover:border-[#0266a2]/50 transition-colors"
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        >
                            <span className="truncate mr-2 font-medium">
                                {selectedCategory 
                                    ? categories.find(c => c.id === selectedCategory)?.nama || 'Semua Kategori'
                                    : 'Semua Kategori'}
                            </span>
                            <div className="flex items-center gap-1.5">
                                {selectedCategory && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategory('');
                                            setPage(1);
                                        }}
                                        className="text-slate-400 hover:text-rose-500 rounded-full p-0.5 hover:bg-rose-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>

                        {isCategoryOpen && (
                            <div className="absolute z-10 top-full mt-2 right-0 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
                                <div className="p-2 border-b border-slate-100">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="text" 
                                            placeholder="Cari kategori..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-lg focus:ring-1 focus:ring-[#0266a2] focus:border-[#0266a2] focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1">
                                    <div 
                                        className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${!selectedCategory ? 'bg-blue-50 text-[#0266a2] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setPage(1);
                                            setIsCategoryOpen(false);
                                            setCategorySearch('');
                                        }}
                                    >
                                        Semua Kategori
                                    </div>
                                    {filteredCategoriesList.length > 0 ? (
                                        filteredCategoriesList.map(c => (
                                            <div 
                                                key={c.id}
                                                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${selectedCategory === c.id ? 'bg-blue-50 text-[#0266a2] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                                onClick={() => {
                                                    setSelectedCategory(c.id);
                                                    setPage(1);
                                                    setIsCategoryOpen(false);
                                                    setCategorySearch('');
                                                }}
                                            >
                                                {c.nama}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-3 py-4 text-sm text-center text-slate-400">
                                            Kategori tidak ditemukan
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="h-10 border-l border-slate-200 hidden sm:block"></div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                        Total: {totalData}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <Box className="w-4 h-4" />
                {totalData} materials found
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-5 gap-4 animate-pulse">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                                <div className="w-20 h-6 bg-slate-200 rounded-md"></div>
                            </div>
                            <div className="mt-2">
                                <div className="w-3/4 h-6 bg-slate-200 rounded mb-2"></div>
                                <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <div className="w-24 h-4 bg-slate-200 rounded"></div>
                                <div className="w-16 h-6 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : materials.map((item) => {
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

                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Stok Tersedia</span>
                                        <span className={`font-bold text-lg ${item.current_stock > 0 ? 'text-[#0266a2]' : 'text-rose-600'}`}>
                                            {item.current_stock} {item.satuan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {totalData > 0 && (
                <div className="bg-white p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-semibold text-slate-700">{(page - 1) * perPage + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(page * perPage, totalData)}</span> dari total <span className="font-semibold text-slate-700">{totalData}</span> data
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
            
            {!isLoading && totalData === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                    <p className="text-slate-500">No materials found.</p>
                </div>
            )}
        </div>
    );
};

export default Materials;
