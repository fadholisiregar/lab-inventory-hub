import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

/**
 * SearchableSelect — drop-in replacement for <select> with a search box.
 *
 * Props:
 *   value        — current value (string/number)
 *   onChange     — called with a synthetic event { target: { value } }
 *   options      — [{ value, label }]
 *   placeholder  — text shown when nothing selected
 *   className    — extra classes on the trigger element
 *   error        — boolean; shows red border
 *   disabled     — boolean
 *   size         — 'sm' | 'md' (default 'md') controls padding/text size
 */
const SearchableSelect = ({
    value = '',
    onChange,
    options = [],
    placeholder = '-- Pilih --',
    className = '',
    error = false,
    disabled = false,
    size = 'md',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [pos, setPos] = useState({ left: 0, width: 0, top: 0, dropUp: false, maxH: 288 });
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const listRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    const filtered = options.filter(o =>
        String(o.label).toLowerCase().includes(search.toLowerCase())
    );

    // Hitung posisi dropdown relatif viewport (untuk portal fixed-position),
    // buka ke atas bila ruang bawah sempit.
    const updatePosition = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const desired = 288; // tinggi maks dropdown (search + list)
        const dropUp = spaceBelow < desired && spaceAbove > spaceBelow;
        const maxH = Math.max(160, Math.min(desired, (dropUp ? spaceAbove : spaceBelow) - 12));
        setPos({ left: rect.left, width: rect.width, top: dropUp ? rect.top : rect.bottom, dropUp, maxH });
    }, []);

    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    // Scroll selected item into view when opening
    useEffect(() => {
        if (isOpen && listRef.current && selected) {
            const el = listRef.current.querySelector('[data-selected="true"]');
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen]);

    // Reposisi saat dibuka, lalu ikuti scroll/resize.
    useEffect(() => {
        if (!isOpen) return;
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    useEffect(() => {
        const handler = (e) => {
            const inTrigger = containerRef.current && containerRef.current.contains(e.target);
            const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!inTrigger && !inDropdown) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const emit = (val) => {
        onChange({ target: { value: val === undefined ? '' : String(val) } });
    };

    const handleSelect = (opt) => {
        emit(opt.value);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        emit('');
    };

    const isSm = size === 'sm';
    const triggerPadding = isSm ? 'px-3 py-2' : 'px-4 py-2.5';
    const textSize = isSm ? 'text-sm' : 'text-sm';
    const borderColor = error
        ? 'border-rose-500 focus:border-rose-500'
        : 'border-slate-200 focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2]';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger */}
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                onClick={() => !disabled && setIsOpen(prev => !prev)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !disabled && setIsOpen(prev => !prev); }
                    if (e.key === 'Escape') { setIsOpen(false); setSearch(''); }
                }}
                tabIndex={disabled ? -1 : 0}
                className={[
                    'w-full border rounded-xl flex items-center justify-between gap-2 cursor-pointer select-none outline-none transition-colors bg-slate-50/50',
                    triggerPadding,
                    textSize,
                    borderColor,
                    isOpen ? 'ring-2 ring-[#0266a2]/20 border-[#0266a2]' : '',
                    disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : '',
                    'text-slate-900',
                ].join(' ')}
            >
                <span className={`truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                    {value !== '' && value !== null && value !== undefined && !disabled && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={handleClear}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                </span>
            </div>

            {/* Dropdown (portal ke body agar tidak terpotong container overflow) */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        left: pos.left,
                        width: pos.width,
                        ...(pos.dropUp
                            ? { bottom: window.innerHeight - pos.top + 4 }
                            : { top: pos.top + 4 }),
                    }}
                    className="z-[9999] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                    {/* Search box */}
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Escape') { setIsOpen(false); setSearch(''); }
                                    if (e.key === 'Enter' && filtered.length === 1) { handleSelect(filtered[0]); }
                                }}
                                placeholder="Cari..."
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0266a2]/20 focus:border-[#0266a2]"
                            />
                        </div>
                    </div>

                    {/* Options list */}
                    <ul ref={listRef} role="listbox" className="overflow-y-auto py-1" style={{ maxHeight: pos.maxH }}>
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-slate-400 text-center">Tidak ditemukan</li>
                        ) : (
                            filtered.map(opt => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        data-selected={isSelected}
                                        onClick={() => handleSelect(opt)}
                                        className={[
                                            'px-4 py-2 text-sm cursor-pointer transition-colors',
                                            isSelected
                                                ? 'bg-blue-50 text-[#0266a2] font-semibold'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                                        ].join(' ')}
                                    >
                                        {opt.label}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SearchableSelect;
