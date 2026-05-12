interface Block {
    id: string;
    type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'h1' | 'h2' | 'h3';
    content: string;
}

export default function StaticBlockRenderer({ blocks }: { blocks: Block[] }) {
    if (!blocks || blocks.length === 0) return null;

    const titleBlock = blocks.find(b =>
        (b.type === 'text' || b.type.startsWith('heading')) &&
        b.content?.trim().length > 0
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {blocks.map((block) => {
                if (titleBlock && block.id === titleBlock.id) {
                    return null;
                }

                switch (block.type) {
                    case 'h1': case 'heading1':
                        return <h1 key={block.id} className="text-4xl font-bold mt-8 mb-4">{block.content}</h1>;
                    case 'h2': case 'heading2':
                        return <h2 key={block.id} className="text-2xl font-bold mt-6 mb-2">{block.content}</h2>;
                    case 'h3': case 'heading3':
                        return <h3 key={block.id} className="text-xl font-bold mt-4 mb-2">{block.content}</h3>;
                    case 'image':
                        return block.content ? (
                            <img
                                key={block.id}
                                src={block.content}
                                className="w-full rounded-xl shadow-lg my-8"
                                alt="Blog content"
                            />
                        ) : null;
                    default:
                        if (!block.content?.trim()) return null;
                        return <p key={block.id} className="text-lg leading-relaxed text-zinc-800">{block.content}</p>;
                }
            })}
        </div>
    );
}