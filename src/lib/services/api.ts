export const savePage = async (pageData: {title: string, blocks: any[]}) => {
    const response = await fetch('http://localhost:5000/api/pages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(pageData)
    });
    return response.json();;
}