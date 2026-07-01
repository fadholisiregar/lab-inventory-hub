import React from 'react';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';

/**
 * Detail lengkap satu penerimaan barang (rincian + riwayat verifikasi).
 * Dipakai bersama di halaman Verifikasi & Riwayat Barang Masuk agar konsisten.
 *
 * Prop `t` = objek penerimaan (sama bentuk dengan response /api/penerimaan).
 */
const PenerimaanDetailBody = ({ t }) => {
    if (!t) return null;

    const batch = t.transaksi?.batch_barang;
    const ghs = t.transaksi?.barang?.sifat_bahan || [];
    const statusNama = t.status_transaksi?.nama || 'Pending';
    const sudahDiproses = statusNama !== 'Pending';
    const disetujui = statusNama === 'Disetujui';

    const th = 'px-4 py-3 bg-slate-50 w-1/3 font-semibold text-slate-700';
    const td = 'px-4 py-3 text-slate-700';

    const kadaluarsaText = (() => {
        if (!batch?.status_kadaluarsa && !batch?.tgl_kadaluarsa) return '-';
        if (batch?.status_kadaluarsa === 'Terisi') return batch?.tgl_kadaluarsa ? formatDate(batch.tgl_kadaluarsa) : '-';
        if (batch?.status_kadaluarsa === 'TidakDicantumkan') return 'Tidak dicantumkan produsen';
        if (batch?.status_kadaluarsa === 'BelumDiinput') return 'Belum diinput (cek label)';
        return batch?.tgl_kadaluarsa ? formatDate(batch.tgl_kadaluarsa) : '-';
    })();

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Rincian Barang Masuk</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <th className={th}>Nama Barang</th>
                                <td className="px-4 py-3 font-medium text-slate-900">{t.transaksi?.barang?.nama_barang || '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>Kategori</th>
                                <td className="px-4 py-3 text-slate-600">{t.transaksi?.barang?.kategori?.nama || '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>Jenis Bahaya</th>
                                <td className={td}>
                                    {ghs.length > 0
                                        ? ghs.map(sb => sb.nama).join(', ')
                                        : '-'}
                                </td>
                            </tr>
                            <tr>
                                <th className={th}>Tanggal Penerimaan</th>
                                <td className={td}>{batch?.tgl_penerimaan ? formatDate(batch.tgl_penerimaan) : '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>Jumlah</th>
                                <td className="px-4 py-3 font-semibold text-[#0266a2]">{t.transaksi?.jumlah} {t.transaksi?.barang?.satuan?.singkatan || ''}</td>
                            </tr>
                            <tr>
                                <th className={th}>Harga Satuan / Total</th>
                                <td className={td}>Rp {Number(t.harga_satuan || 0).toLocaleString('id-ID')} / Rp {Number(t.harga_total || 0).toLocaleString('id-ID')}</td>
                            </tr>
                            <tr>
                                <th className={th}>Penyedia / Vendor</th>
                                <td className={td}>
                                    {batch?.penyedia
                                        ? `${batch.penyedia.kode_penyedia || '-'} - ${batch.penyedia.nama_penyedia}`
                                        : '-'}
                                </td>
                            </tr>
                            <tr>
                                <th className={th}>Nomor Batch</th>
                                <td className="px-4 py-3 font-medium text-slate-900">{batch?.kode_batch || '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>Kadaluarsa</th>
                                <td className={td}>{kadaluarsaText}</td>
                            </tr>
                            <tr>
                                <th className={th}>Jenis Kegiatan</th>
                                <td className={td}>{t.jenis_kegiatan || '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>PIC Barang Masuk</th>
                                <td className={td}>{t.laboran?.user?.name || '-'}</td>
                            </tr>
                            <tr>
                                <th className={th}>Link Bukti Pengadaan</th>
                                <td className={td}>
                                    {t.link_pengadaan ? (
                                        <a href={t.link_pengadaan} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            Lihat Dokumen <Eye className="w-3 h-3" />
                                        </a>
                                    ) : '-'}
                                </td>
                            </tr>
                            <tr>
                                <th className={th}>Sumber Input</th>
                                <td className={td}>{t.sumber_input === 'csv' ? 'Import (CSV/Excel)' : 'Input Web'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Riwayat Verifikasi */}
            <div>
                <h4 className="font-bold text-slate-800 mb-3 text-sm">Riwayat Verifikasi</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-800 text-sm">Pengajuan Dibuat</div>
                                <div className="text-xs font-medium text-slate-500">{formatDate(t.created_at)}</div>
                            </div>
                            <div className="text-sm text-slate-600">Oleh: {t.creator?.name || '-'} (Petugas Gudang)</div>
                        </div>
                    </div>

                    {sudahDiproses && (
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white ${disetujui ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                                {disetujui ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className={`font-bold text-sm ${disetujui ? 'text-emerald-700' : 'text-rose-700'}`}>{statusNama}</div>
                                    <div className="text-xs font-medium text-slate-500">{formatDate(t.updated_at)}</div>
                                </div>
                                <div className="text-sm text-slate-600">Oleh: Koordinator Gudang</div>
                                {t.catatan && <div className="text-xs text-slate-500 mt-1">Catatan: {t.catatan}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PenerimaanDetailBody;
