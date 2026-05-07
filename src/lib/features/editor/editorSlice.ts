import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { EditorBlock, EditorState } from "./types";

const initialState: EditorState = {
    blocks: [
        { id: '1', type: 'heading1', content: '' },
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
        setBlocks: (state, action) => { 
            state.blocks = action.payload; 
        },

        togglePublicStatus: (state) => {
            state.isPublic = !state.isPublic;
        },

        setCurrentPage: (state, action: PayloadAction<{ _id: string; isPublic: boolean; blocks: EditorBlock[] }>) => {
            state.currentPageId = action.payload._id;
            state.isPublic = action.payload.isPublic;
            state.blocks = action.payload.blocks;

            if (action.payload.blocks.length > 0) {
                state.activeBlockId = action.payload.blocks[0].id;
            }
        },

        updateBlockContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
            const block = state.blocks.find(block => block.id === action.payload.id);
            if (block) {
                block.content = action.payload.content;
            }
        },

        addBlock: (state, action: PayloadAction<{ afterId?: string, type: EditorBlock['type'] }>) => {
            const newBlock: EditorBlock = {
                id: crypto.randomUUID(),
                type: action.payload.type,
                content: '',
            };

            if (action.payload.afterId) {
                const index = state.blocks.findIndex(block => block.id === action.payload.afterId);
                state.blocks.splice(index + 1, 0, newBlock);
            } else {
                state.blocks.push(newBlock);
            }
            
            state.activeBlockId = newBlock.id;
        },

        deleteBlock: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.blocks.findIndex(block => block.id === action.payload.id);
            if (index !== -1) {
                const isDeletedFocused = state.activeBlockId === action.payload.id;

                if (isDeletedFocused) {
                    if (index > 0) {
                        state.activeBlockId = state.blocks[index - 1].id;
                    } else if (index < state.blocks.length - 1) {
                        state.activeBlockId = state.blocks[index + 1].id;
                    }
                }

                state.blocks.splice(index, 1);

                if (state.blocks.length === 0) {
                    const fallbackBlock: EditorBlock = { 
                        id: crypto.randomUUID(), 
                        type: 'text', 
                        content: '' 
                    };
                    state.blocks.push(fallbackBlock);
                    state.activeBlockId = fallbackBlock.id;
                }
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

                if (previousBlock.type !== 'image') {
                    previousBlock.content += currentBlock.content;
                    state.activeBlockId = previousBlock.id;
                    state.blocks.splice(index, 1);
                }
            }
        },

        focusPreviousBlock: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.blocks.findIndex(b => b.id === action.payload.id);
            if (index > 0) {
                state.activeBlockId = state.blocks[index - 1].id;
            }
        },

        focusNextBlock: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.blocks.findIndex(b => b.id === action.payload.id);
            if (index < state.blocks.length - 1) {
                state.activeBlockId = state.blocks[index + 1].id;
            }
        },
        
        setActiveBlock: (state, action: PayloadAction<{ id: string }>) => {
            state.activeBlockId = action.payload.id;
        }
    },
});

export const {
    updateBlockContent,
    addBlock,
    deleteBlock,
    changeBlockType,
    mergeWithPrevious,
    setBlocks,
    togglePublicStatus,
    setCurrentPage,
    focusPreviousBlock,
    focusNextBlock,
    setActiveBlock
} = editorSlice.actions;

export default editorSlice.reducer;