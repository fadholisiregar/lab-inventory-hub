import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LogOut,
    LayoutDashboard,
    FileText,
    Box,
    BarChart2,
    BarChart3,
    User,
    Search,
    Bell,
    Plus,
    CheckSquare,
    List,
    Users,
    Shield,
    Settings,
    ClipboardList,
    ChevronDown,
    Database,
    Menu,
    X
} from 'lucide-react';

const Layout = () => {
    const { user, isLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSwitchRoleModalOpen, setIsSwitchRoleModalOpen] = useState(false);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: prev[label] === undefined ? false : !prev[label] }));
    };

    // Hooks must be called before early returns
    const roles = user?.roles || [];
    const [activeRole, setActiveRole] = useState(() => {
        const savedRole = localStorage.getItem('activeRole');
        return savedRole && roles.includes(savedRole) ? savedRole : (roles[0] || 'Laboran');
    });

    React.useEffect(() => {
        if (roles.length > 0 && !roles.includes(activeRole)) {
            setActiveRole(roles[0]);
            localStorage.setItem('activeRole', roles[0]);
        }
    }, [roles, activeRole]);

    const handleRoleSwitch = (role) => {
        setActiveRole(role);
        localStorage.setItem('activeRole', role);
        navigate('/'); // This will be handled by the next effect if needed
    };

    React.useEffect(() => {
        if (activeRole === 'Koordinator Gudang' && location.pathname === '/') {
            navigate('/users', { replace: true });
        }
    }, [activeRole, location.pathname, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0266a2]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Helper untuk menentukan menu aktif
    const isActive = (path) => location.pathname === path;

    const isLaboran = activeRole === 'Laboran';
    const isKoordinator = activeRole === 'Koordinator Gudang'; // This is now Super Admin
    const isPetugasGudang = activeRole === 'Petugas Gudang'; // This is now the warehouse staff
    const isPetugasOrLaboran = isPetugasGudang || isLaboran;

    let navItems = [];

    if (isKoordinator) {
        navItems = [
            {
                label: 'Referensi',
                icon: Database,
                subItems: [
                    { path: '/kategori', label: 'Kategori Barang' },
                    { path: '/satuan', label: 'Satuan' },
                    { path: '/kategori-rumpun', label: 'Kategori Rumpun' },
                    { path: '/status-transaksi', label: 'Status Transaksi' },
                    { path: '/ruang-laboratorium', label: 'Ruang Laboratorium' },
                    { path: '/lokasi-penyimpanan', label: 'Lokasi Penyimpanan' },
                    { path: '/barang', label: 'Barang' },
                ]
            },
            {
                label: 'Barang Masuk',
                icon: Box,
                subItems: [
                    { label: 'Verifikasi', path: '/verifikasi/masuk' },
                    { label: 'Riwayat', path: '/history/masuk' }
                ]
            },
            {
                label: 'Barang Keluar',
                icon: CheckSquare,
                subItems: [
                    { label: 'Verifikasi', path: '/verifikasi/keluar' },
                    { label: 'Riwayat', path: '/history/keluar' }
                ]
            },
            {
                label: 'Manajemen User',
                icon: Users,
                subItems: [
                    { path: '/petugas-gudang', label: 'Petugas Gudang' },
                    { path: '/koordinator', label: 'Koordinator' },
                    { path: '/laboran', label: 'Laboran' },
                    { path: '/roles', label: 'Role' },
                    { path: '/users', label: 'User' }
                ]
            }
        ];
    } else {
        // Transaksi untuk Petugas Gudang
        if (isPetugasGudang) {
            navItems = [
                {
                    label: 'Barang Masuk',
                    icon: Box,
                    subItems: [
                        { path: '/penerimaan', label: 'Barang Masuk' },
                        { path: '/history/masuk', label: 'Riwayat' }
                    ]
                },
                {
                    label: 'Barang Keluar',
                    icon: CheckSquare,
                    subItems: [
                        { path: '/pengeluaran', label: 'Verifikasi' },
                        { path: '/history/keluar', label: 'Riwayat' }
                    ]
                }
            ];
        } else if (isLaboran) {
            // Sesuai permintaan, untuk Laboran sementara hanya menu Permintaan Bahan
            navItems = [
                { path: '/pengeluaran', label: 'Permintaan Bahan', icon: FileText }
            ];
        } else {
            navItems = [
                { path: '/', label: 'Beranda', icon: LayoutDashboard }
            ];
        }
    }

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-transparent flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500 p-2 rounded-lg text-white">
                            <Box className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-bold text-slate-900 leading-tight">Lab Inventory</h1>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        if (item.subItems) {
                            const isOpen = openMenus[item.label] ?? true; // Default open
                            const hasActiveSub = item.subItems.some(sub => isActive(sub.path));
                            return (
                                <div key={item.label} className="flex flex-col gap-1 mb-2">
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${hasActiveSub && !isOpen
                                            ? 'bg-blue-50 text-[#0266a2]'
                                            : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${hasActiveSub ? 'text-[#0266a2]' : 'text-slate-400'}`} />
                                            {item.label}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="pl-11 pr-3 flex flex-col gap-1 mt-1">
                                            {item.subItems.map(sub => {
                                                const active = isActive(sub.path);
                                                return (
                                                    <Link
                                                        key={sub.path}
                                                        to={sub.path}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                                            ? 'bg-[#0266a2] text-white shadow-md shadow-blue-900/10'
                                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                    ? 'bg-[#0266a2] text-white shadow-md shadow-blue-900/10'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
                                    {item.label}
                                </div>
                                {item.badge && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-amber-400 text-white'
                                        }`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>


            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">

                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6 ml-6">

                        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-6 h-6" />
                            {/* Notification Badge */}
                            <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Removed Desktop Select Switcher */}

                        <div className="w-px h-8 bg-slate-200"></div>

                        {/* User Avatar Dropdown */}
                        <div className="relative">
                            <div
                                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold shadow-sm border-2 border-white outline outline-2 outline-slate-100">
                                    {getInitials(user.name)}
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                                    <p className="text-xs text-slate-500 leading-tight">{activeRole}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0266a2]"
                                    >
                                        Profil
                                    </Link>

                                    <Link
                                        to="/change-password"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0266a2]"
                                    >
                                        Ganti Password
                                    </Link>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main scrollable content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
