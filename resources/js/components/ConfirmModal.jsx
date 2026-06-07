import React, { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', variant = 'warning' }) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const variantStyles = {
        warning: {
            icon: 'bg-amber-100 text-amber-600',
            button: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300',
        },
        danger: {
            icon: 'bg-red-100 text-red-600',
            button: 'bg-red-500 hover:bg-red-600 focus:ring-red-300',
        },
        info: {
            icon: 'bg-blue-100 text-blue-600',
            button: 'bg-[#0266a2] hover:bg-[#01578a] focus:ring-blue-300',
        },
    };

    const styles = variantStyles[variant] || variantStyles.warning;

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                    <X size={18} />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${styles.icon}`}>
                            <AlertTriangle size={28} />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                        {title || 'Konfirmasi'}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex flex-1 items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:outline-none focus:ring-2 disabled:opacity-70 ${styles.button}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
