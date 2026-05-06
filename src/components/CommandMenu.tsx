'use client'

interface CommandMenuProps {
    position: { x: number; y: number };
    onSelect: (type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image') => void; 
    close: () => void;
}
export default function CommandMenu({ position, onSelect, close }: CommandMenuProps) {
    return (
        <>
            <div className="fixed inset-0 z-10" onClick={close} />

            <div
                className="fixed z-20 w-64 bg-white border border-slate-500 rounded-lg shadow-xl p-2 animate-in fade-in zoom-in duration-100"
                style={{ top: position.y + 10, left: position.x }}
            >
                <p className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Basic Blocks
                </p>    

                <button
                    onClick={() => onSelect('text')}
                    className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 transition-colors"
                >
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 font-bold">T</div>
                    <div>
                        <p className="text-sm font-medium">Text</p>
                        <p className="text-xs text-slate-400">Just start writing...</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('heading1')}
                    className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 transition-colors"
                >
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 font-bold font-serif">H1</div>
                    <div>
                        <p className="text-sm font-medium">Heading 1</p>
                        <p className="text-xs text-slate-400">Big section heading</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('heading2')}
                    className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 transition-colors"
                >
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 font-bold font-serif">H2</div>
                    <div>
                        <p className="text-sm font-medium">Heading 2</p>
                        <p className="text-xs text-slate-400">Medium section heading</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('heading3')}
                    className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 transition-colors"
                >
                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 font-bold font-serif">H3</div>
                    <div>
                        <p className="text-sm font-medium">Heading 3</p>
                        <p className="text-xs text-slate-400">Small section heading</p>
                    </div>
                </button>

                <button
                    onClick={() => onSelect('image')}
                    className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3"
                >
                    <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center text-green-500 font-bold">📷</div>
                    <div>
                        <p className="text-sm font-medium">Image</p>
                        <p className="text-xs text-slate-400">Upload or embed with a link</p>
                    </div>
                </button>
            </div>
        </>
    );
}