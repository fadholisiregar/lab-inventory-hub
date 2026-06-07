import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { Users as UsersIcon, Shield, Search, Check, AlertCircle } from 'lucide-react';

const Users = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setError(null);
            const response = await axios.get('/api/users');
            setUsers(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('Gagal memuat data pengguna');
            setIsLoading(false);
        }
    };

    const openEditModal = (targetUser) => {
        setEditingUser(targetUser);
        setSelectedRoles([...(targetUser.roles || [])]);
        setIsEditModalOpen(true);
    };

    const handleRoleToggle = (role) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleSaveRoles = async () => {
        if (!editingUser) return;
        
        let newRoles = [...selectedRoles];
        
        // Prevent removing own Admin Gudang role
        if (editingUser.id === user.id && !newRoles.includes('Admin Gudang') && (editingUser.roles || []).includes('Admin Gudang')) {
            setError("Anda tidak dapat menghapus role Admin Gudang pada akun Anda sendiri.");
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (newRoles.length === 0) {
            newRoles = ['Laboran']; // Fallback
        }

        setIsSaving(true);
        try {
            await axios.put(`/api/users/${editingUser.id}/roles`, { roles: newRoles });
            setSuccessMessage('Role berhasil diperbarui');
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, roles: newRoles } : u));
            setIsEditModalOpen(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memperbarui role');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalData = filteredUsers.length;
    const totalPages = Math.ceil(totalData / perPage);
    const paginatedData = filteredUsers.slice((page - 1) * perPage, page * perPage);

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
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-[#0266a2]" />
                        Manajemen Pengguna
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola pengguna dan hak akses role pada sistem.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600">{successMessage}</p>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
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
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2] text-slate-900"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada pengguna ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((u) => {
                                    const roles = u.roles || [];
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-900">{u.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {roles.map(r => (
                                                        <span key={r} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{r}</span>
                                                    ))}
                                                    {roles.length === 0 && <span className="text-slate-400 text-xs">-</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center gap-2 text-sm font-medium transition-colors"
                                                >
                                                    <Shield className="w-4 h-4" /> Edit Role
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
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

            {/* Edit Roles Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Edit Role Pengguna</h3>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                    {editingUser.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 leading-tight">{editingUser.name}</p>
                                    <p className="text-sm text-slate-500">{editingUser.email}</p>
                                </div>
                            </div>
                            
                            <p className="text-sm font-semibold text-slate-700 mb-3">Pilih Role Akses:</p>
                            <div className="space-y-2">
                                {['Laboran', 'Koordinator Gudang', 'Admin Gudang'].map((role) => (
                                    <label key={role} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                        selectedRoles.includes(role) ? 'border-[#0266a2] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                                    }`}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRoles.includes(role)}
                                            onChange={() => handleRoleToggle(role)}
                                            className="w-4 h-4 text-[#0266a2] rounded border-slate-300 focus:ring-[#0266a2]"
                                            disabled={editingUser.id === user.id && role === 'Admin Gudang'}
                                        />
                                        <span className={`text-sm font-medium ${selectedRoles.includes(role) ? 'text-[#0266a2]' : 'text-slate-700'}`}>
                                            Role {role}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSaveRoles}
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#0266a2] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
