'use client';
import { useState } from 'react';
import Navbar from '@/src/components/Navbar';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Something went wrong");

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (<>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-5">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-center">Join Explorer.</h1>

                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">{error}</p>}

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">Full Name</label>
                    <input required type="text" placeholder="John Doe" onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2.5 rounded-lg focus:ring-2 ring-blue-500 outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">Email</label>
                    <input required type="email" placeholder="email@example.com" onChange={e => setForm({ ...form, email: e.target.value })} className="border p-2.5 rounded-lg focus:ring-2 ring-blue-500 outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-zinc-700">Password</label>
                    <input required type="password" placeholder="••••••••" onChange={e => setForm({ ...form, password: e.target.value })} className="border p-2.5 rounded-lg focus:ring-2 ring-blue-500 outline-none" />
                </div>

                <button type="submit" className="bg-black text-white py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors mt-2">
                    Create Account
                </button>
            </form>
        </div></>   
    );
}