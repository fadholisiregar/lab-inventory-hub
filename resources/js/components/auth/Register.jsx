import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
    const { register, user, isLoading } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [nip_nik, setNipNik] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password_confirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register({ name, nip_nik, email, password, password_confirmation, setErrors });
            navigate('/');
        } catch (error) {
            // Error handled in useAuth
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 sm:p-12 overflow-y-auto">
            <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 my-8">
                    
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Buat Akun Baru</h2>
                        <p className="text-slate-500 text-sm">Lengkapi data di bawah untuk mendaftar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Error Messages */}
                        {errors.email && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-600">
                                    {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                                </span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Masukkan nama"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">NIP atau NIK</label>
                            <input
                                type="text"
                                required
                                value={nip_nik}
                                onChange={(e) => setNipNik(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Masukkan NIP atau NIK"
                            />
                            {errors.nip_nik && <p className="mt-1 text-sm text-red-500">{errors.nip_nik[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="anda@itk.ac.id"
                            />
                            {/* email error displayed on top */}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Buat kata sandi"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Kata Sandi</label>
                            <input
                                type="password"
                                required
                                value={password_confirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="Ketik ulang kata sandi"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0266a2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0266a2] disabled:opacity-60 transition-all mt-6"
                        >
                            {isSubmitting ? 'Memproses...' : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Daftar Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Sudah memiliki akun?{' '}
                        <Link to="/login" className="font-medium text-[#0266a2] hover:text-blue-700">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
        </div>
    );
};

export default Register;
