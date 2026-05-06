export default function StaticBlockRenderer({ blocks }: { blocks: any[] }) {
    if (!blocks) return null;
    return (
        <div className="space-y-4">
            {blocks.map((block: any) => (
                <div key={block.id}>
                    {block.type === 'heading' && <h1 className="text-3xl font-bold">{block.content}</h1>}
                    {block.type === 'text' && <p>{block.content}</p>}
                    {/* Add other types as needed */}
                </div>
            ))}
        </div>
    );
}