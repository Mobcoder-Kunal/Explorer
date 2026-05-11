'use client'
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function LikeButton({ postId, initialLikes, isLikedInitial }: any) {
    const { data: session } = useSession();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(isLikedInitial);

    const handleLike = async () => {
        if (!session) return alert("Log in to like this story!");

        try {
            const res = await fetch(`http://localhost:5000/api/pages/${postId}/likes`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${(session as any).accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setLikes(data.likesCount);
                setIsLiked(!isLiked);
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    }

    return (
        <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isLiked ? 'text-red-500 border-red-200 bg-red-50' : 'text-zinc-500'}`}>
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likes}</span>
        </button>
    );
}