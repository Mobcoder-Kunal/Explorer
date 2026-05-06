'use client';

import { useAppSelector } from "../lib/hooks";
import EditableBlock from "./EditableBlock";

function BlockRenderer() {
    const blocks = useAppSelector(state => state.editor.blocks)

    return (
        <div className="max-w-3xl mx-auto p-10 space-y-2" >
            {
                blocks.map((block: any) => <EditableBlock key={block.id} block={block} />)
            }
        </div>
    )
}

export default BlockRenderer;