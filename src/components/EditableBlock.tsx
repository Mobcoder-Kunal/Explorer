'use client';
import { useEffect, useRef, useState } from "react";
import CommandMenu from "./CommandMenu";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { EditorBlock } from "../lib/features/editor/types";
import {
    updateBlockContent,
    addBlock,
    deleteBlock,
    changeBlockType,
    mergeWithPrevious,
    focusPreviousBlock,
    focusNextBlock
} from "../lib/features/editor/editorSlice";

interface Props {
    block: EditorBlock;
}

function EditableBlock({ block }: Props) {
    const dispatch = useAppDispatch();
    const contentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isTyping = useRef(false);

    const activeBlockId = useAppSelector((state) => state.editor.activeBlockId);
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (activeBlockId === block.id && contentRef.current) {
            contentRef.current.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [activeBlockId, block.id]);

    useEffect(() => {
        const domElement = contentRef.current;
        if (!domElement || isTyping.current) {
            isTyping.current = false;
            return;
        }
        if (domElement.innerText !== block.content) {
            domElement.innerText = block.content;
        }
    }, [block.content, block.type]);

    const handleInput = () => {
    if (contentRef.current) {
        isTyping.current = true;
        const text = contentRef.current.innerText;
        dispatch(updateBlockContent({ id: block.id, content: text }));

        if (text.endsWith('/')) {
            // We don't need to calculate rects anymore if using 'absolute' 
            // but we keep the toggle
            setShowMenu(true);
        } else if (showMenu) {
            setShowMenu(false);
        }
    }
};

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showMenu) return; // Let the menu handle arrows if open

        if (e.key === 'Enter') {
            e.preventDefault();
            dispatch(addBlock({ afterId: block.id, type: 'text' }));
        }

        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);
            if (range?.startOffset === 0) {
                e.preventDefault();
                dispatch(mergeWithPrevious({ id: block.id }));
            }
        }

        if (e.key === 'ArrowUp') {
            dispatch(focusPreviousBlock({ id: block.id }));
        }

        if (e.key === 'ArrowDown') {
            dispatch(focusNextBlock({ id: block.id }));
        }
    };

    const handleSelect = (type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image') => {
        dispatch(changeBlockType({ id: block.id, type }));
        if (contentRef.current) {
            const text = contentRef.current.innerText.replace('/', '');
            dispatch(updateBlockContent({ id: block.id, content: text }));
            contentRef.current.innerText = text;
        }
        setShowMenu(false);
    };

    const getBlockStyle = () => {
        switch (block.type) {
            case 'heading1': return 'text-4xl font-bold mb-4 mt-2';
            case 'heading2': return 'text-2xl font-bold mb-3 mt-2';
            case 'heading3': return 'text-xl font-bold mb-2 mt-1';
            default: return 'text-lg mb-2';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch(updateBlockContent({ id: block.id, content: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (block.type === 'image') {
        return (
            <div
                className="relative group my-4 outline-none"
                tabIndex={0} // Makes the div focusable so it can catch keys
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        dispatch(addBlock({ afterId: block.id, type: 'text' }));
                    }
                    if (e.key === 'Backspace' && !block.content) {
                        dispatch(deleteBlock({ id: block.id }));
                    }
                }}
            >
                <div className="relative group my-4 w-full h-auto min-h-[50px]">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {block.content ? (
                        <div className="relative inline-block w-full">
                            <img src={block.content} className="w-full h-auto rounded-lg block" alt="Uploaded content" />
                            <button onClick={() => dispatch(updateBlockContent({ id: block.id, content: '' }))} className="absolute top-2 left-2 bg-white/80 p-1 rounded text-xs hover:bg-white transition-opacity opacity-0 group-hover:opacity-100">
                                Change Image
                            </button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="p-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100">
                            <span className="text-3xl mb-2">🖼️</span>
                            <p className="text-slate-500 font-medium">Click to upload an image</p>
                        </div>
                    )}
                    <button onClick={() => dispatch(deleteBlock({ id: block.id }))} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Delete
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative group w-full mb-1 ${showMenu ? 'z-50' : 'z-0'}`}>
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                className={`
                    w-full p-3 rounded-lg transition-all duration-200 outline-none
                    border border-transparent
                    hover:bg-slate-50
                    focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400
                ${activeBlockId === block.id ? 'z-10' : 'z-0'}
                ${getBlockStyle()}
                    ${getBlockStyle()}
                    /* Ensure visibility */
                    block overflow-visible
                `}
                data-placeholder={
                    block.type === 'heading1' ? 'Heading 1' :
                        block.type === 'heading2' ? 'Heading 2' :
                            block.type === 'heading3' ? 'Heading 3' :
                                "Type '/' for commands..."
                }
                style={{ minHeight: '1.5em', wordBreak: 'break-word' }}
            />

            {showMenu && (
                <CommandMenu
                    onSelect={handleSelect}
                    close={() => setShowMenu(false)}
                />
            )}
        </div>
    );
}

export default EditableBlock;