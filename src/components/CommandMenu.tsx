'use client';
import { useEffect, useState, useRef, useLayoutEffect } from "react";

interface CommandMenuProps {
    onSelect: (type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image') => void;
    close: () => void;
}

const MENU_OPTIONS = [
    { id: 'text', label: 'Text', sub: 'Just start writing...', icon: 'T', color: 'bg-slate-100 text-slate-500' },
    { id: 'heading1', label: 'Heading 1', sub: 'Big section heading', icon: 'H1', color: 'bg-blue-50 text-blue-500 font-serif' },
    { id: 'heading2', label: 'Heading 2', sub: 'Medium section heading', icon: 'H2', color: 'bg-blue-50 text-blue-500 font-serif' },
    { id: 'heading3', label: 'Heading 3', sub: 'Small section heading', icon: 'H3', color: 'bg-blue-50 text-blue-500 font-serif' },
    { id: 'image', label: 'Image', sub: 'Upload or embed', icon: '📷', color: 'bg-green-50 text-green-500' },
] as const;

export default function CommandMenu({ onSelect, close }: CommandMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const [renderAbove, setRenderAbove] = useState(false);

    useLayoutEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // If the bottom of the menu would go off-screen, flip it to render above the cursor
            if (rect.bottom > viewportHeight) {
                setRenderAbove(true);
            }
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % MENU_OPTIONS.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                onSelect(MENU_OPTIONS[selectedIndex].id);
            } else if (e.key === "Escape") {
                close();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, onSelect, close]);

    return (
        <>
            {/* Transparent overlay to close menu when clicking outside */}
            <div className="fixed inset-0 z-[60]" onClick={close} />

            <div
                ref={menuRef}
                className={`
                absolute z-[70] w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-2 
                animate-in fade-in zoom-in duration-100 overflow-hidden
            `}
                style={{
                    // Position it relative to the parent EditableBlock
                    top: renderAbove ? 'auto' : '100%',
                    bottom: renderAbove ? '100%' : 'auto',
                    left: 0,
                    marginTop: renderAbove ? '0' : '8px',
                    marginBottom: renderAbove ? '8px' : '0',
                }}
            >
                <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-widest mb-1">
                    Basic Blocks
                </p>

                <div className="space-y-0.5">
                    {MENU_OPTIONS.map((option, index) => (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`
                                w-full text-left px-2 py-1.5 rounded-md flex items-center gap-3 transition-colors outline-none
                                ${index === selectedIndex ? "bg-slate-100 text-slate-900" : "text-slate-700"}
                            `}
                        >
                            <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center font-bold shadow-sm ${option.color}`}>
                                {option.icon}
                            </div>
                            <div className="flex flex-col leading-tight">
                                <p className="text-sm font-semibold">{option.label}</p>
                                <p className="text-[11px] text-slate-400 truncate">{option.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}