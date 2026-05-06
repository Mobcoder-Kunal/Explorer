'use client';

import { useAppSelector } from "../lib/hooks";
import EditableBlock from "./EditableBlock";

function    BlockRenderer() {
    // 1. Get the blocks from the store
    const blocks = useAppSelector(state => state.editor.blocks)

    return (
        <div className="max-w-3xl mx-auto p-10 space-y-2" >
            {
                blocks.map((block) => <EditableBlock key={block.id} block={block} />)
            }
        </div>
    )
}

export default BlockRenderer;