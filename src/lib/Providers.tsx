'use client';

import { SessionProvider } from "next-auth/react";
import StoreProvider from "@/src/lib/StoreProvider";
import AuthSync from "@/src/lib/AuthSync";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <StoreProvider>
                <AuthSync>
                    {children}
                </AuthSync>
            </StoreProvider>
        </SessionProvider>
    );
}