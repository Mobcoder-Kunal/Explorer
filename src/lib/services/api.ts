interface Block {
    id: string;
    type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image';
    content: string;
}

interface PageData {
    title: string;
    blocks: Block[];
}

export const savePage = async (pageData: PageData) => {
    const response = await fetch('http://localhost:5000/api/pages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(pageData)
    });
    return response.json();;
}