export type BlockType = 'text' | 'heading' | 'image' | 'todo';

export interface EditorBlock {
    id: string;
    type: BlockType;
    content: string;
    metadata?: {
        checked?: boolean;
    };
}

export interface EditorState {
    blocks: EditorBlock[];
    activeBlockId: string | null;
    isSaving: boolean;
    isPublic: boolean;
    currentPageId: string | null;
}