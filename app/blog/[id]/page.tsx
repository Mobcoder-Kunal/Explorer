'use client';

import { notFound } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import StaticBlockRenderer from "@/src/components/StaticBlockRenderer";
import LikeButton from "@/src/components/LikeButton";
import ViewCounter from "@/src/components/ViewCounter";
import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react"; // Added use
import Image from "next/image";

interface User {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
}

interface Comment {
    _id: string;
    userId: User;
    text: string;
    createdAt: string;
}

interface Block {
    id: string;
    type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'h1' | 'h2' | 'h3';
    content: string;
}

interface BlogPost {
    _id: string;
    title: string;
    blocks: Block[];
    userId: User;
    views: number;
    likes: string[];
    comments: Comment[];
    updatedAt: string;
    createdAt: string;
}

interface ExtendedSession {
    user: {
        id: string;
        email?: string | null;
        name?: string | null;
        accessToken: string;
    };
}
export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
    // 1. Unwrap the params Promise using React.use()
    const { id } = use(params);

    const { data: session } = useSession();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/pages/${id}`);
                if (!res.ok) {
                    notFound();
                    return;
                }
                const data = await res.json();
                setPost(data);
            } catch (error) {
                console.error("Failed to fetch post:", error);
                notFound();
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleCommentSubmit = async () => {
        if (!session || !commentText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5000/api/pages/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${(session as unknown as ExtendedSession).user.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: commentText.trim() })
            });

            if (res.ok) {
                const data = await res.json();
                setPost(prev => prev ? {
                    ...prev,
                    comments: [...prev.comments, data.comment]
                } : null);
                setCommentText("");
            } else {
                alert("Failed to post comment. Please try again.");
            }
        } catch (error) {
            console.error("Comment error:", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-3xl mx-auto p-10">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        notFound();
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <ViewCounter postId={post._id} />
            <article className="max-w-3xl mx-auto py-16 px-6">

                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 leading-tight">
                    {post.title || "Untitled Post"}
                </h1>

                <div className="flex items-center justify-between mb-10 pb-8 border-b">
                    <div className="flex items-center gap-4">
                        <Image
                            src={post.userId?.profilePic || `https://ui-avatars.com/api/?name=${post.userId?.name || "Anonymous"}`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full border shadow-sm"
                            alt={post.userId?.name || "Anonymous"}
                            unoptimized
                        />
                        <div>
                            <p className="text-zinc-900 font-medium text-lg">{post.userId?.name || "Anonymous"}</p>
                            <div className="text-zinc-500 text-sm flex gap-2">
                                <span>{new Date(post.updatedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>{post.views || 0} views</span>
                            </div>
                        </div>
                    </div>

                    <LikeButton
                        postId={post._id}
                        initialLikes={post.likes?.length || 0}
                        isLikedInitial={session ? post.likes?.includes((session as unknown as ExtendedSession).user.id) : false}
                    />
                </div>

                <div className="mb-20">
                    <StaticBlockRenderer blocks={post.blocks} />
                </div>

                <section className="border-t pt-12 mt-12">
                    <h3 className="text-2xl font-bold mb-8">Comments ({post.comments?.length || 0})</h3>

                    {session ? (
                        <div className="bg-zinc-50 p-4 rounded-xl mb-10 border border-zinc-100">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="What are your thoughts?"
                                className="w-full bg-transparent border-none focus:ring-0 text-zinc-700 resize-none h-24"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Posting..." : "Respond"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-50 p-4 rounded-xl mb-10 border border-zinc-100">
                            <p className="text-zinc-600 text-center py-4">Please log in to leave a comment.</p>
                        </div>
                    )}

                    <div className="space-y-8">
                        {post.comments?.length > 0 ? (
                            post.comments.map((comment: Comment) => (
                                <div key={comment._id} className="flex gap-4">
                                    <Image
                                        src={comment.userId?.profilePic || `https://ui-avatars.com/api/?name=${comment.userId?.name}`}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full border"
                                        alt={comment.userId?.name || "User Avatar"}
                                        unoptimized
                                    />
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-zinc-900">{comment.userId?.name}</span>
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