import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email?: string | null;
            name?: string | null;
            accessToken: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        id?: string;
    }
}

interface CustomUser {
    id: string;
    email: string;
    name: string;
    accessToken: string;
}
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

                const data = await res.json();

                console.log("Backend Response:", data);

                if (res.ok && data.user) {
                    return {
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        accessToken: data.token
                    };
                }

                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User | undefined }) {
            if (user && (user as CustomUser).accessToken) {
                token.accessToken = (user as CustomUser).accessToken;
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user && token.accessToken && token.id) {
                session.user.accessToken = token.accessToken;
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: '/login' }
});

export { handler as GET, handler as POST };