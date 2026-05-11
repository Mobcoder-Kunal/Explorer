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
                    <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-zinc-900">
                        Stay curious.
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-xl">
                        Discover stories, thinking, and expertise from writers on any topic.
                    </p>
                </header>

                <div className="space-y-12 border-t pt-12">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-xl border border-dashed">
                            <p className="text-zinc-400">No public stories yet.</p>
                        </div>
                    ) : (
                        posts.map((post: any) => {
                            const title = post.title || "Untitled Story";
                            const previewText = post.blocks.find((b: any) =>
                                b.type === 'text' && b.content.trim() !== ""
                            )?.content || "Read more...";
                            const previewImage = post.blocks.find((b: any) => b.type === 'image')?.content;

                            // Get author info
                            const authorName = post.userId?.username || "Explorer Writer";
                            const authorPic = post.userId?.profilePic || "https://ui-avatars.com/api/?name=" + authorName;

                            return (
                                <article key={post._id} className="group border-b pb-10 last:border-0">
                                    <div className="flex items-center gap-2 mb-4">
                                        <img src={authorPic} className="w-6 h-6 rounded-full object-cover" alt={authorName} />
                                        <span className="text-sm font-medium text-zinc-800">{authorName}</span>
                                        <span className="text-zinc-400 text-xs">•</span>
                                        <span className="text-zinc-500 text-xs">{new Date(post.updatedAt).toLocaleDateString()}</span>
                                    </div>

                                    <Link href={`/blog/${post._id}`} className="flex flex-col md:flex-row gap-8 justify-between items-start">
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold font-serif group-hover:text-zinc-600 transition-colors mb-3 leading-snug">
                                                {title}
                                            </h2>
                                            <p className="text-zinc-600 line-clamp-2 leading-relaxed font-sans text-lg mb-4">
                                                {previewText}
                                            </p>

                                            {/* --- NEW: Stats Row --- */}
                                            <div className="flex items-center gap-4 text-zinc-500 text-sm">
                                                <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-full">
                                                    <span>👀</span> {post.views || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-full">
                                                    <span>❤️‍🔥</span> {post.likes?.length || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-full">
                                                    <span>💬</span> {post.comments?.length || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {previewImage && (
                                            <div className="w-full md:w-48 h-32 flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                                                <img
                                                    src={previewImage}
                                                    alt={title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
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