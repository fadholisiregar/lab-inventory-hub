import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PenerimaanBarang from './PenerimaanBarang';
import PengeluaranBarang from './PengeluaranBarang';
import { ClipboardCheck } from 'lucide-react';

const Verifikasi = () => {
    const { jenis } = useParams();
    const isMasuk = jenis === 'masuk';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ClipboardCheck className="w-7 h-7 text-[#0266a2]" />
                        {isMasuk ? 'Verifikasi Barang Masuk' : 'Verifikasi Barang Keluar'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Verifikasi permintaan {isMasuk ? 'barang masuk' : 'barang keluar'}.
                    </p>
                </div>
            </div>

            <div className="pt-2">
                {isMasuk ? <PenerimaanBarang isVerifikasiMode={true} /> : <PengeluaranBarang isVerifikasiMode={true} />}
            </div>
        </div>
    );
};

export default Verifikasi;
