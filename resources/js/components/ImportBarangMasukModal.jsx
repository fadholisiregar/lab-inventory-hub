import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, XCircle, CheckCircle, AlertTriangle, Download, X, Loader2, FileUp, Info } from 'lucide-react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const ImportBarangMasukModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [result, setResult] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        const mainEl = document.querySelector('main');
        if (!mainEl) return;
        mainEl.style.overflowY = isOpen ? 'hidden' : '';
        return () => { mainEl.style.overflowY = ''; };
    }, [isOpen]);

    const resetState = () => {
        setFile(null);
        setResult(null);
        setIsUploading(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    // Drag & Drop handlers
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
            setResult(null);
        } else {
            toast.error('File harus berformat .xlsx atau .xls');
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
            setResult(null);
        } else if (selectedFile) {
            toast.error('File harus berformat .xlsx atau .xls');
        }
    };

    const isValidFile = (f) => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ['xlsx', 'xls'].includes(ext);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/penerimaan/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data);

            if (response.data.success_count > 0) {
                toast.success(`${response.data.success_count} baris berhasil diimport!`);
                if (onSuccess) onSuccess();
            }
            if (response.data.error_count > 0) {
                toast.error(`${response.data.error_count} baris gagal diimport.`);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Gagal mengupload file.';
            toast.error(msg);
            if (error.response?.data) {
                setResult(error.response.data);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = async () => {
        setIsDownloading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await axios.get(`/api/penerimaan/import/template?t=${timestamp}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Template_Import_Barang_Masuk.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Template berhasil diunduh!');
        } catch (error) {
            toast.error('Gagal mengunduh template.');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="fixed inset-0 overflow-y-auto" onClick={handleClose}>
                <div className="flex min-h-full items-start justify-center p-2 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 sm:my-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                Import Barang Masuk (XLSX)
                            </h3>
                            <button onClick={handleClose} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Download Template */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                <div className="flex-1 text-sm text-blue-700">
                                    Gunakan template resmi untuk memastikan format data sesuai.
                                </div>
                                <button
                                    onClick={handleDownloadTemplate}
                                    disabled={isDownloading}
                                    className="px-4 py-2 text-xs font-semibold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Download className="w-3.5 h-3.5" />
                                    )}
                                    Download Template
                                </button>
                            </div>

                            {/* Upload Zone */}
                            {!result && (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                        isDragging
                                            ? 'border-emerald-400 bg-emerald-50 scale-[1.01]'
                                            : file
                                            ? 'border-emerald-300 bg-emerald-50/50'
                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                                    }`}
                                >
                                    {file ? (
                                        <div className="space-y-3">
                                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
                                                <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">{file.name}</p>
                                                <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => { setFile(null); setResult(null); }}
                                                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                                            >
                                                Hapus & pilih file lain
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                                                <FileUp className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700">
                                                    Drag & drop file di sini
                                                </p>
                                                <p className="text-sm text-slate-500">atau</p>
                                            </div>
                                            <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0266a2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors">
                                                <Upload className="w-4 h-4" />
                                                Pilih File
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            <p className="text-xs text-slate-400">Format: .xlsx, .xls (Maks. 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Result */}
                            {result && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-slate-700">{result.total_rows ?? 0}</p>
                                            <p className="text-xs text-slate-500 mt-1">Total Baris</p>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-emerald-600">{result.success_count ?? 0}</p>
                                            <p className="text-xs text-emerald-600 mt-1">Berhasil</p>
                                        </div>
                                        <div className={`rounded-xl p-4 text-center border ${(result.error_count ?? 0) > 0 ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <p className={`text-2xl font-bold ${(result.error_count ?? 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{result.error_count ?? 0}</p>
                                            <p className={`text-xs mt-1 ${(result.error_count ?? 0) > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Gagal</p>
                                        </div>
                                    </div>

                                    {/* Errors */}
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
                                            <h4 className="font-semibold text-sm text-rose-800 flex items-center gap-1.5">
                                                <XCircle className="w-4 h-4" />
                                                Error ({result.errors.length})
                                            </h4>
                                            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                                                {result.errors.map((err, idx) => (
                                                    <div key={idx} className="text-xs bg-white border border-rose-100 rounded-lg px-3 py-2 flex items-start gap-2">
                                                        <span className="shrink-0 font-mono text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                                                            Baris {err.row}
                                                        </span>
                                                        <span className="text-slate-700">
                                                            <strong className="text-rose-700">{err.field}</strong>: {err.message}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Warnings */}
                                    {result.warnings && result.warnings.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                                            <h4 className="font-semibold text-sm text-amber-800 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4" />
                                                Warning ({result.warnings.length})
                                            </h4>
                                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                                                {result.warnings.map((warn, idx) => (
                                                    <div key={idx} className="text-xs bg-white border border-amber-100 rounded-lg px-3 py-2 flex items-start gap-2">
                                                        <span className="shrink-0 font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                                            Baris {warn.row}
                                                        </span>
                                                        <span className="text-slate-700">
                                                            <strong className="text-amber-700">{warn.field}</strong>: {warn.message}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Success message */}
                                    {(result.success_count ?? 0) > 0 && (result.error_count ?? 0) === 0 && (!result.warnings || result.warnings.length === 0) && (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <p className="text-sm text-emerald-800 font-medium">
                                                Semua {result.success_count} baris berhasil diimport dan menunggu verifikasi Koordinator.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            {result ? (
                                <>
                                    <button
                                        onClick={() => { setFile(null); setResult(null); }}
                                        className="px-4 py-2.5 text-sm font-semibold text-[#0266a2] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                    >
                                        Import Lagi
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2.5 text-sm font-semibold text-white bg-[#0266a2] hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                                    >
                                        Selesai
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file || isUploading}
                                        className={`px-4 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2 ${
                                            !file || isUploading
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Upload & Import
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ImportBarangMasukModal;
