import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Camera, AlertCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QRScannerModal = ({ isOpen, onClose, onScan }) => {
    const [error, setError] = useState('');

    const handleDecode = (result) => {
        if (result && result.length > 0) {
            const code = result[0].rawValue;
            onScan(code);
            onClose();
        }
    };

    const handleError = (err) => {
        if (err?.message?.includes('Permission denied') || err?.name === 'NotAllowedError') {
            setError('Akses kamera ditolak. Mohon izinkan akses kamera pada browser Anda.');
        } else {
            console.error('QR Scanner error:', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md my-auto relative overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
                            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-[#0266a2]" />
                                Scan Kode Barang
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center relative min-h-[300px]">
                            {error ? (
                                <div className="text-center p-6 bg-slate-900/50 rounded-xl max-w-sm mx-auto border border-rose-500/30">
                                    <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-slate-300">{error}</p>
                                    <button 
                                        onClick={() => { setError(''); onClose(); }}
                                        className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                                    >
                                        Tutup Scanner
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-sm aspect-square relative rounded-xl overflow-hidden ring-4 ring-slate-800">
                                    <Scanner
                                        onScan={handleDecode}
                                        onError={handleError}
                                        components={{
                                            audio: false,
                                            onOff: false,
                                            torch: true,
                                            zoom: false,
                                            finder: true,
                                        }}
                                        styles={{
                                            container: { width: '100%', height: '100%' }
                                        }}
                                    />
                                    {/* Overlay Scanner Line Animation */}
                                    <div className="absolute inset-x-0 top-0 h-0.5 bg-green-500/80 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)] animate-[scan_2s_ease-in-out_infinite]" style={{ animationName: 'scan' }}></div>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                            <p className="text-xs text-slate-500 font-medium">Arahkan kamera perangkat Anda ke QR Code atau Barcode yang tertera pada fisik barang.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QRScannerModal;
