'use client';
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/src/lib/hooks";
import { togglePublicStatus, setCurrentPage } from "@/src/lib/features/editor/editorSlice";

export default function EditorHeader() {
    const dispatch = useAppDispatch();
    const { blocks, isPublic, currentPageId } = useAppSelector((state) => state.editor);
    const [status, setStatus] = useState("Draft");

    const handleSubmit = async () => {
    setStatus("Saving...");
    try {
        const response = await fetch('http://localhost:5000/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                _id: currentPageId,
                blocks, 
                isPublic 
            }),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setCurrentPage(data));
            setStatus("Saved!");
        }
    } catch (err) {
        setStatus("Error");
    }
};

    return (
        <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'Saved!' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                <span className="text-sm text-slate-500 font-medium">{status}</span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(togglePublicStatus())}
                    className={`text-sm px-4 py-1.5 rounded-full border transition-all ${isPublic
                        ? 'bg-green-50 border-green-200 text-green-700 shadow-sm cursor-pointer'
                        : 'bg-slate-50 border-slate-200 text-slate-600 cursor-pointer'
                        }`}
                >
                    {isPublic ? '🌍 Public (Live)' : '🔒 Private Draft'}
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-black text-white px-6 py-1.5 rounded-md text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                    Add Idea
                </button>
            </div>
        </div>
    );
}