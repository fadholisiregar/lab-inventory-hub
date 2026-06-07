import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login, user, isLoading } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            await login({ email, password, setErrors });
            navigate('/');
        } catch (error) {
            // Error handled in useAuth
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            {/* Left Panel - Blue Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0266a2] text-white p-12 flex-col justify-center">
                <div className="max-w-md mx-auto">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm">
                            <Box className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">ITK Lab</h1>
                            <p className="text-blue-100 text-sm">Manajemen Stok</p>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <h2 className="text-4xl lg:text-5xl font-medium leading-tight mb-6">
                        Selamat Datang di Sistem<br />Manajemen Gudang
                    </h2>
                    
                    <p className="text-blue-100 text-lg mb-12 leading-relaxed">
                        Kelola bahan dan peralatan laboratorium Anda secara efisien dengan sistem manajemen inventaris modern kami.
                    </p>

                    {/* Feature List */}
                    <ul className="space-y-5 text-blue-50">
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                            <span className="text-[15px]">Pemantauan stok secara real-time</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                            <span className="text-[15px]">Alur persetujuan otomatis (RBAC)</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                            <span className="text-[15px]">Penerapan logika FEFO pada bahan</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
                    
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Masuk</h2>
                        <p className="text-slate-500 text-sm">Masukkan kredensial untuk mengakses akun Anda</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Error Messages */}
                        {Object.keys(errors).length > 0 && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-600">
                                    {errors.email ? (Array.isArray(errors.email) ? errors.email[0] : errors.email) : 
                                     errors.password ? (Array.isArray(errors.password) ? errors.password[0] : errors.password) :
                                     errors.message || 'Email atau kata sandi salah. Silakan coba lagi.'}
                                </span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm"
                                placeholder="anda@itk.ac.id"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#0266a2] focus:border-transparent transition-all sm:text-sm pr-10"
                                    placeholder="Masukkan kata sandi"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-500">{errors.password[0]}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#0266a2] focus:ring-[#0266a2] border-slate-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                                    Ingat saya
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-[#0266a2] hover:text-blue-700 transition-colors">
                                    Lupa kata sandi?
                                </Link>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0266a2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0266a2] disabled:opacity-60 transition-all mt-2"
                        >
                            {isSubmitting ? (
                                'Memproses...'
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Masuk Ke Sistem
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex justify-center text-sm my-6">
                        <span className="text-slate-500 font-medium">ATAU</span>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={() => window.location.href = '/auth/google'}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-2 bg-white border border-slate-300 rounded-xl shadow-sm text-[15px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Lanjutkan dengan Google
                    </button>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Belum memiliki akun?{' '}
                        <Link to="/register" className="font-medium text-[#0266a2] hover:text-blue-700">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
