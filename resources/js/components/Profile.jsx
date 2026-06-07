import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { formatDate } from '../utils/dateFormatter';
import { User, Mail, Shield, Calendar, Clock, RefreshCcw, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
    const { user } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [activeRole, setActiveRole] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [isSwitchRoleModalOpen, setIsSwitchRoleModalOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        const storedRole = localStorage.getItem('activeRole');

        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        } else if (user) {
            setUserInfo(user);
        }

        if (storedRole) {
            setActiveRole(storedRole);
            setSelectedRole(storedRole);
        }
    }, [user]);

    if (!userInfo) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#0266a2]/20 border-t-[#0266a2] rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleRoleSwitch = (r) => {
        localStorage.setItem('activeRole', r);
        window.location.href = '/'; // Reload to apply new role across Layout
    };

    const hasMultipleRoles = userInfo.roles && userInfo.roles.length > 1;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6 text-[#0266a2]" />
                Profil Pengguna
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#0266a2] to-blue-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 bg-amber-500 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {userInfo.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{userInfo.name}</h2>
                                <p className="text-slate-500 font-medium mt-1">Role Aktif: <span className="text-[#0266a2] font-bold">{activeRole || '-'}</span></p>
                            </div>
                            {hasMultipleRoles && (
                                <button
                                    onClick={() => {
                                        setSelectedRole(activeRole);
                                        setIsSwitchRoleModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Ganti Role
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Email Address</p>
                                        <p className="text-slate-900 font-medium">{userInfo.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Semua Role Tersedia</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {userInfo.roles?.map(role => (
                                                <span key={role} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0266a2] border border-blue-100">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Terdaftar Sejak</p>
                                        <p className="text-slate-900 font-medium">{formatDate(userInfo.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Terakhir Diperbarui</p>
                                        <p className="text-slate-900 font-medium">{formatDate(userInfo.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Ganti Role in Profile */}
            {isSwitchRoleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Ganti Role Akses</h3>
                            <button onClick={() => setIsSwitchRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">Pilih role yang ingin Anda gunakan saat ini:</p>
                            <div className="space-y-2">
                                {userInfo.roles?.map(r => (
                                    <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedRole === r ? 'border-[#0266a2] bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input
                                            type="radio"
                                            name="role_selection"
                                            checked={selectedRole === r}
                                            onChange={() => setSelectedRole(r)}
                                            className="w-4 h-4 text-[#0266a2] border-slate-300 focus:ring-[#0266a2]"
                                        />
                                        <span className={`text-sm font-medium ${selectedRole === r ? 'text-[#0266a2]' : 'text-slate-700'}`}>{r}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsSwitchRoleModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleRoleSwitch(selectedRole)}
                                disabled={!selectedRole || selectedRole === activeRole}
                                className="px-4 py-2 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
