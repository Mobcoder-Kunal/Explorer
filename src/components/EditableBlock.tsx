'use client';
import { useEffect, useRef, useState } from "react";
import CommandMenu from "./CommandMenu";
import { useAppDispatch } from "../lib/hooks";
import { useAppSelector } from "../lib/hooks";
import { EditorBlock } from "../lib/features/editor/types";
import { updateBlockContent, addBlock, deleteBlock, changeBlockType, mergeWithPrevious } from "../lib/features/editor/editorSlice";

interface Props {
    block: EditorBlock,
}

function EditableBlock({ block }: Props) {
    const dispatch = useAppDispatch();
    const contentRef = useRef<HTMLDivElement>(null);

    // Grab the ID of block that should focus
    const activeBlockId = useAppSelector((state) => state.editor.activeBlockId);

    const [showMenu, setShowMenu] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

    const isTyping = useRef(false);

    // Focus logic
    useEffect(() => {
        if (activeBlockId === block.id && contentRef.current) {
            contentRef.current.focus();

            // Move cursor to the end of the text -> Notion behaviour
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(contentRef.current);
            range.collapse(false); // false means "collapse to end"
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, [activeBlockId, block.id])

    // Sync logic
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
            dispatch(
                updateBlockContent({
                    id: block.id,
                    content: text,
                })
            )
            if (text.endsWith('/')) {
                const selection = window.getSelection();    // Finds exactly where the blinking cursor is
                const range = selection?.getRangeAt(0);    // Grabs the specific "slice" of the document where that cursor sits.
                const rect = range?.getBoundingClientRect();// This is the magic. It gives you the pixel coordinates (X and Y) of the cursor relative to the screen.

                if (rect) {
                    setMenuPosition({ x: rect.left, y: rect.bottom }) // We save those pixels so we can tell our Menu exactly where to "pop up" on the screen.
                    setShowMenu(true)
                } else {
                    setShowMenu(false)
                }
            }
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // We tell Redux to add a new block right after this one
            dispatch(
                addBlock({
                    afterId: block.id,
                    type: 'text'
                })
            );
        }

        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            const range = selection?.getRangeAt(0);

            if (range?.startOffset === 0) {
                e.preventDefault();
                dispatch(mergeWithPrevious({ id: block.id }));
            }
        }
    }

    const handleSelect = (type: 'text' | 'heading' | 'image') => {
        dispatch(changeBlockType({ id: block.id, type }));
        setShowMenu(false);
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // This converts the image file into a very long string
                const base64String = reader.result as string;
                // Update our Redux content with the image data
                dispatch(updateBlockContent({ id: block.id, content: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (block.type === 'image') {
        return (
            <div className="relative group my-4" key={`image-${block.id}`}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                {block.content ? (
                    <div className="relative">
                        <img src={block.content} className="w-full h-auto rounded-lg" alt="Uploaded content" />
                        <button
                            onClick={() => dispatch(updateBlockContent({ id: block.id, content: '' }))}
                            className="absolute top-2 left-2 bg-white/80 p-1 rounded text-xs hover:bg-white"
                        >
                            Change Image
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        <span className="text-3xl mb-2">🖼️</span>
                        <p className="text-slate-500 font-medium">Click to upload an image</p>
                    </div>
                )}
                <button
                    onClick={() => {
                        console.log("Delete clicked for ID:", block.id);
                        dispatch(deleteBlock({ id: block.id }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Delete
                </button>
            </div>
        );
    }


    return (
        <div className="relative">
            <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                className={`
                w-full p-2 rounded-md transition-all duration-150 outline-none
                hover:bg-slate-50 
                ${block.content === '' ? 'border border-dashed border-slate-100' : 'border border-transparent'}
                focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-transparent
                ${block.type === 'heading' ? 'text-4xl font-bold mb-4 mt-2' : 'text-lg mb-2'}
            `}
                placeholder={block.type === 'heading' ? 'Heading 1' : "Type '/' for commands..."}
                style={{ minHeight: '1.5em' }}
            >
                {showMenu && (
                    <CommandMenu
                        position={menuPosition}
                        onSelect={handleSelect}
                        close={() => setShowMenu(false)}
                    />
                )}
            </div>
        </div>
    )
}

export default EditableBlock;


// 1. Why contentEditable instead of <input>?
// In Notion, blocks can grow vertically as you type long paragraphs. A standard <input> or <textarea> is hard to style and doesn't auto-resize easily. Using a div with contentEditable allows the block to look like natural text (Medium-style) but still be interactive.

// 2. How to read styles[block.type as keyof typeof styles]?
// This is a TypeScript Power Move.

// We have an object called styles with keys like heading and text.

// block.type is a string from our Redux store.

// as keyof typeof styles tells TypeScript: "Trust me, the string in block.type is definitely one of the keys in the styles object." This prevents a red underline error.

// 3. The onInput vs onChange
// With contentEditable, standard onChange doesn't always fire correctly. We use onInput because it catches every single character change, ensuring your Redux store is perfectly synced with what is on the screen.