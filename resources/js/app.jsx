import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Pages & Layout
import Layout from './components/Layout';
import StockDetail from './components/StockDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/Dashboard';
import Requests from './components/Requests';
import Materials from './components/Materials';
import Reports from './components/Reports';
import Users from './components/Users';
import Kategori from './components/Kategori';
import Satuan from './components/Satuan';
import RuangLaboratorium from './components/RuangLaboratorium';
import Barang from './components/Barang';
import Roles from './components/Roles';
import PetugasGudang from './components/PetugasGudang';
import Laboran from './components/Laboran';
import Koordinator from './components/Koordinator';
import KategoriRumpun from './components/KategoriRumpun';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';
import PenerimaanBarang from './components/PenerimaanBarang';
import PengeluaranBarang from './components/PengeluaranBarang';
import HistoryTransaksi from './components/HistoryTransaksi';
import StatusTransaksi from './components/StatusTransaksi';
import Verifikasi from './components/Verifikasi';
import LokasiPenyimpanan from './components/LokasiPenyimpanan';
import Penyedia from './components/Penyedia';
import JenisKegiatan from './components/JenisKegiatan';
import ProgramStudi from './components/ProgramStudi';
import MataKuliah from './components/MataKuliah';
import ModulPraktikum from './components/ModulPraktikum';
import KebutuhanPraktikum from './components/KebutuhanPraktikum';
import PengadaanPraktikum from './components/PengadaanPraktikum';
import LaporanRealisasi from './components/LaporanRealisasi';
import Laporan from './components/Laporan';

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <Provider store={store}>
                <BrowserRouter>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Guest Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Protected Routes inside Layout */}
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/requests" element={<Requests />} />
                            <Route path="/penerimaan" element={<PenerimaanBarang />} />
                            <Route path="/pengeluaran" element={<PengeluaranBarang />} />
                            <Route path="/verifikasi" element={<Verifikasi />} />
                            <Route path="/verifikasi/:jenis" element={<Verifikasi />} />
                            <Route path="/history" element={<HistoryTransaksi />} />
                            <Route path="/history/:jenis" element={<HistoryTransaksi />} />
                            <Route path="/materials" element={<Materials />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/kategori" element={<Kategori />} />
                            <Route path="/satuan" element={<Satuan />} />
                            <Route path="/kategori-rumpun" element={<KategoriRumpun />} />
                            <Route path="/status-transaksi" element={<StatusTransaksi />} />
                            <Route path="/ruang-laboratorium" element={<RuangLaboratorium />} />
                            <Route path="/kategori-rumpun" element={<KategoriRumpun />} />
                            <Route path="/lokasi-penyimpanan" element={<LokasiPenyimpanan />} />
                            <Route path="/penyedia" element={<Penyedia />} />
                            <Route path="/jenis-kegiatan" element={<JenisKegiatan />} />
                            <Route path="/program-studi" element={<ProgramStudi />} />
                            <Route path="/mata-kuliah" element={<MataKuliah />} />
                            <Route path="/modul-praktikum" element={<ModulPraktikum />} />
                            <Route path="/kebutuhan-praktikum" element={<KebutuhanPraktikum />} />
                            <Route path="/pengadaan-praktikum" element={<PengadaanPraktikum />} />
                            <Route path="/laporan-realisasi" element={<LaporanRealisasi />} />
                            <Route path="/barang" element={<Barang />} />
                            <Route path="/roles" element={<Roles />} />
                            <Route path="/petugas-gudang" element={<PetugasGudang />} />
                            <Route path="/laboran" element={<Laboran />} />
                            <Route path="/koordinator" element={<Koordinator />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="/laporan" element={<Laporan />} />
                            <Route path="/laporan/:tab" element={<Laporan />} />
                            <Route path="/dashboard" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </React.StrictMode>
    );
}
