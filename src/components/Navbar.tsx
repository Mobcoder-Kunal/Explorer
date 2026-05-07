'use client';
import Link from 'next/link';
import { signIn, signOut } from "next-auth/react";
import { useAppSelector } from "@/src/lib/hooks";

export default function Navbar() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
                {/* Left Side: Logo & Search */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-2xl font-serif font-bold tracking-tighter mr-4">
                        Explorer<span className="text-blue-600">.</span>
                    </Link>
                </div>

                {/* Right Side: Links & Auth */}
                <div className="flex items-center gap-6">
                    <Link href="/our-story" className="hidden sm:block text-sm text-zinc-600 hover:text-black transition-colors">
                        Our story
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link href="/editor" className="flex items-center gap-2 text-zinc-500 hover:text-black">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-sm hidden md:inline">Write</span>
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="text-sm text-zinc-600 hover:text-red-600 transition-colors cursor-pointer"
                            >
                                Sign out
                            </button>

                            <div className="w-8 h-8 bg-blue-100 flex items-center justify-center rounded-full cursor-pointer hover:ring-2 ring-zinc-100 transition-all">
                                <span className="text-xs font-bold text-blue-600">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => signIn()}
                                className="text-sm text-zinc-600 hover:text-black transition-colors cursor-pointer"
                            >
                                Sign in
                            </button>
                            <Link
                                href="/signup"
                                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}