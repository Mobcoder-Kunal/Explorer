'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError("Invalid email or password");
        } else {
            router.push('/');
            router.refresh(); 
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-5">
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-center">Welcome Back.</h1>

                    {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">{error}</p>}

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Email</label>
                        <input 
                            required 
                            type="email" 
                            placeholder="email@example.com" 
                            onChange={e => setForm({ ...form, email: e.target.value })} 
                            className="border p-2.5 rounded-lg focus:ring-2 ring-blue-500 outline-none" 
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">Password</label>
                        <input 
                            required 
                            type="password" 
                            placeholder="••••••••" 
                            onChange={e => setForm({ ...form, password: e.target.value })} 
                            className="border p-2.5 rounded-lg focus:ring-2 ring-blue-500 outline-none" 
                        />
                    </div>

                    <button 
                        disabled={loading}
                        type="submit" 
                        className="bg-black text-white py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors mt-2 disabled:bg-zinc-400"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    
                    <p className="text-center text-sm text-zinc-500">
                        No account? <a href="/signup" className="text-blue-600 hover:underline">Create one</a>
                    </p>
                </form>
            </div>
        </>
    );
}