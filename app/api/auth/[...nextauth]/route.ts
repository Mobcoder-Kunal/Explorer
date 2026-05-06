import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const res = await fetch("http://localhost:5000/api/auth/login", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });

                const user = await res.json();

                if (!res.ok || !user) {
                    return null;
                }

                return user;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: '/login' }
});

export { handler as GET, handler as POST };