import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditorBlock, EditorState } from "./types";

const initialState: EditorState = {
    blocks: [
        { id: '1', type: 'heading', content: '' },
        { id: '2', type: 'text', content: '' },
    ],
    activeBlockId: '1',
    isSaving: false,
    isPublic: false,
    currentPageId: null,
};

export const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setBlocks: (state, action) => { state.blocks = action.payload; },
        
        togglePublicStatus: (state) => {
            state.isPublic = !state.isPublic;
        },

        setCurrentPage: (state, action: PayloadAction<{ _id: string; isPublic: boolean; blocks: EditorBlock[] }>) => {
            state.currentPageId = action.payload._id;
            state.isPublic = action.payload.isPublic;
            state.blocks = action.payload.blocks;
        },

        updateBlockContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
            const block = state.blocks.find(block => block.id === action.payload.id);
            if (block) {
                block.content = action.payload.content;
            }
        },
        
        addBlock: (state, action: PayloadAction<{ afterId: string, type: EditorBlock['type'] }>) => {
            const index = state.blocks.findIndex(block => block.id === action.payload.afterId)
            const newBlock: EditorBlock = {
                id: crypto.randomUUID(),
                type: action.payload.type,
                content: '',
            };
            const insertAt = index === -1 ? state.blocks.length : index + 1;
            state.blocks.splice(insertAt, 0, newBlock);
            state.activeBlockId = newBlock.id;
        },

        deleteBlock: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.blocks.findIndex(block => block.id === action.payload.id);
            if (index !== -1) {
                if (state.activeBlockId === action.payload.id) {
                    if (index > 0) {
                        state.activeBlockId = state.blocks[index - 1].id;
                    } else if (index < state.blocks.length - 1) {
                        state.activeBlockId = state.blocks[index + 1].id;
                    } else {
                        const newBlock: EditorBlock = { id: Date.now().toString(), type: 'text', content: '' };
                        state.blocks.push(newBlock);
                        state.activeBlockId = newBlock.id;
                    }
                }
                state.blocks.splice(index, 1);
            }
        },

        changeBlockType: (state, action: PayloadAction<{ id: string; type: EditorBlock['type'] }>) => {
            const block = state.blocks.find(b => b.id === action.payload.id);
            if (block) {
                block.type = action.payload.type;
                if (action.payload.type !== 'image') {
                    block.content = block.content.replace('/', '');
                } else {
                    block.content = '';
                }
            }
        },

        mergeWithPrevious: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.blocks.findIndex(block => block.id === action.payload.id);
            if (index > 0) {
                const currentBlock = state.blocks[index];
                const previousBlock = state.blocks[index - 1];
                previousBlock.content += currentBlock.content;
                state.activeBlockId = previousBlock.id;
                state.blocks.splice(index, 1);
            }
        }
    },
});

// Added togglePublicStatus and setCurrentPage to exports
export const { 
    updateBlockContent, 
    addBlock, 
    deleteBlock, 
    changeBlockType, 
    mergeWithPrevious, 
    setBlocks,
    togglePublicStatus,
    setCurrentPage
} = editorSlice.actions;

export default editorSlice.reducer;