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
        async jwt({ token, user }: any) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }: any) {
            if (session.user) {
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