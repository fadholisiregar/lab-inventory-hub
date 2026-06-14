import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
};

const Modal = ({ isOpen, children, size = 'md', className = '' }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    className={`bg-white rounded-2xl shadow-xl w-full overflow-hidden ${sizeMap[size] ?? 'max-w-md'} my-8 sm:my-10 ${className}`}
                >
                    {children}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default Modal;
