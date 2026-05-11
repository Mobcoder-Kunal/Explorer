'use client'
import { useEffect, useRef } from "react"

export default function ViewCounter({ postId }: { postId: string }) {
    const hasCalled = useRef(false);

    useEffect(() => {
        if (!hasCalled.current) {
            fetch(`http://localhost:5000/api/pages/${postId}/views`, {
                method: 'PATCH',
            }).catch(err => console.log("Failed to register view", err));
            
            hasCalled.current = true;
        }
    }, [postId]);

    return null;
}