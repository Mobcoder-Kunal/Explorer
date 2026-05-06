'use client';
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { setUser } from "./features/auth/authSlice";

export default function AuthSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            dispatch(setUser({
                id: (session.user as any).id,
                name: session.user.name || "",
                email: session.user.email || ""
            }));
        } else if (status === "unauthenticated") {
            dispatch(setUser(null));
        }
    }, [session, status, dispatch]);

    return <>{children}</>;
}