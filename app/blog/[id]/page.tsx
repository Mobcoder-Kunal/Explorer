import { notFound } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import StaticBlockRenderer from "@/src/components/StaticBlockRenderer";

async function getBlogPost(id: string) {
    try {
        const res = await fetch(`http://localhost:5000/api/pages/${id}`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BlogPage(props: PageProps) {
    const params = await props.params;
    const post = await getBlogPost(params.id);

    if (!post) notFound();

    const authorName = post.userId?.username || "Explorer Writer";
    const authorPic = post.userId?.profilePic || "https://ui-avatars.com/api/?name=" + authorName;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <article className="max-w-3xl mx-auto py-16 px-6">

                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 leading-tight">
                    {post.title || "Untitled Post"}
                </h1>

                <div className="flex items-center justify-between mb-10 pb-8 border-b">
                    <div className="flex items-center gap-4">
                        <img src={authorPic} className="w-12 h-12 rounded-full border shadow-sm" alt={authorName} />
                        <div>
                            <p className="text-zinc-900 font-medium text-lg">{authorName}</p>
                            <div className="text-zinc-500 text-sm flex gap-2">
                                <span>{new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>{post.views || 0} views</span>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-50 transition-colors text-sm font-medium">
                        ❤️‍🔥 {post.likes?.length || 0}
                    </button>
                </div>

                <div className="mb-20">
                    <StaticBlockRenderer blocks={post.blocks} />
                </div>

                <section className="border-t pt-12 mt-12">
                    <h3 className="text-2xl font-bold mb-8">Comments ({post.comments?.length || 0})</h3>

                    <div className="bg-zinc-50 p-4 rounded-xl mb-10 border border-zinc-100">
                        <textarea
                            placeholder="What are your thoughts?"
                            className="w-full bg-transparent border-none focus:ring-0 text-zinc-700 resize-none h-24"
                        />
                        <div className="flex justify-end mt-2">
                            <button className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer">
                                Respond
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {post.comments?.length > 0 ? (
                            post.comments.map((comment: any) => (
                                <div key={comment._id} className="flex gap-4">
                                    <img
                                        src={comment.userId?.profilePic || `https://ui-avatars.com/api/?name=${comment.userId?.username}`}
                                        className="w-8 h-8 rounded-full border"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-zinc-900">{comment.userId?.username}</span>
                                            <span className="text-zinc-400 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-700 leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-400 italic">No comments yet. Be the first to start the conversation.</p>
                        )}
                    </div>
                </section>
            </article>
        </div>
    );
}