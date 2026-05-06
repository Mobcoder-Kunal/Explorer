import Link from 'next/link';
import Navbar from '@/src/components/Navbar';

async function getPublicPosts() {
    try {
        const res = await fetch('http://localhost:5000/api/blogs/public', { 
            cache: 'no-store' 
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

export default async function HomePage() {
    const posts = await getPublicPosts();

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            
            <main className="max-w-4xl mx-auto py-16 px-6">
                <header className="mb-12">
                    <h1 className="text-4   xl md:text-6xl font-serif font-medium tracking-tight mb-4">
                        Stay curious.
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-xl">
                        Discover stories, thinking, and expertise from writers on any topic.
                    </p>
                </header>

                <div className="space-y-12 border-t pt-12">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-xl border border-dashed">
                            <p className="text-zinc-400">No public stories yet. Be the first to write one!</p>
                        </div>
                    ) : (
                        posts.map((post: any) => {
                            const title = post.blocks.find((b: any) => b.type === 'heading')?.content || "Untitled Story";
                            const preview = post.blocks.find((b: any) => b.type === 'text')?.content || "Click to read more...";

                            return (
                                <article key={post._id} className="group flex flex-col gap-2">
                                    <Link href={`/blog/${post._id}`}>
                                        <div className="cursor-pointer">
                                            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-zinc-500">
                                                <span>{new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span>•</span>
                                                <span className="text-blue-600">Public</span>
                                            </div>
                                            
                                            <h2 className="text-2xl font-bold font-serif group-hover:text-zinc-600 transition-colors mb-2">
                                                {title}
                                            </h2>
                                            
                                            <p className="text-zinc-600 line-clamp-2 leading-relaxed font-sans text-lg">
                                                {preview}
                                            </p>

                                            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-70 group-hover:opacity-100 transition-opacity">
                                                Read full story <span>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            )
                        })
                    )}
                </div>
            </main>
        </div>
    );
}