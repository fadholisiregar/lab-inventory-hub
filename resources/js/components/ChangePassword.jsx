import React, { useState } from 'react';
import { Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/user/change-password', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(response.data.message);
            setFormData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Terjadi kesalahan saat mengubah password.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#0266a2]" />
                Ganti Password
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8">
                {successMessage && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-200">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium text-sm">{successMessage}</p>
                    </div>
                )}
                
                {errors.general && (
                    <div className="mb-6 bg-rose-50 text-rose-700 p-4 rounded-xl flex items-center gap-3 border border-rose-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="font-medium text-sm">{errors.general}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Saat Ini</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${errors.current_password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0266a2] focus:ring-[#0266a2]/20'}`}
                                placeholder="Masukkan password saat ini"
                            />
                        </div>
                        {errors.current_password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.current_password[0]}</p>}
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:outline-none transition-all ${errors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-[#0266a2] focus:ring-[#0266a2]/20'}`}
                                placeholder="Minimal 8 karakter"
                            />
                        </div>
                        {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CheckCircle className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none focus:border-[#0266a2] focus:ring-[#0266a2]/20 transition-all"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#0266a2] hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-900/20"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Simpan Password Baru'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
