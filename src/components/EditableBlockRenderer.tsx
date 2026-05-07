'use client';

import { useAppDispatch, useAppSelector } from "../lib/hooks";
import EditableBlock from "./EditableBlock";
import { addBlock, setActiveBlock } from "../lib/features/editor/editorSlice";

function BlockRenderer() {
    const blocks = useAppSelector(state => state.editor.blocks);
    const dispatch = useAppDispatch();

    const handleAddBottomBlock = () => {
        const lastBlock = blocks[blocks.length - 1];

        if (lastBlock && lastBlock.type === 'text' && lastBlock.content === "") {
            dispatch(setActiveBlock({ id: lastBlock.id }));
        } else {
            dispatch(addBlock({ type: 'text' }));
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-10 min-h-screen flex flex-col">
            <div className="space-y-2">
                {blocks.map((block: any) => (
                    <EditableBlock key={block.id} block={block} />
                ))}
            </div>

            <div
                onClick={handleAddBottomBlock}
                className="flex-grow cursor-text py-20 min-h-[200px]"
                title="Click to add a block"
            >
            </div>
        </div>
    );
}

export default BlockRenderer;