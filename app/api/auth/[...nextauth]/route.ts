import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/backend/models/User";

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
                try {
                    if (mongoose.connection.readyState !== 1) {
                        await mongoose.connect('mongodb://127.0.0.1:27017/blog_app');
                    }

                    console.log('Looking for user with email:', credentials?.email?.toLowerCase());
                    const user = await User.findOne({ email: credentials?.email?.toLowerCase() });
                    console.log('User found:', user ? 'yes' : 'no');
                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    const isValid = await bcrypt.compare(credentials!.password, user.password);
                    console.log('Password valid:', isValid);
                    if (!isValid) {
                        throw new Error("Incorrect password");
                    }

                    return { 
                        id: user._id.toString(), 
                        email: user.email, 
                        name: user.name 
                    };
                } catch {
                    console.log('Unauthorized access attempt for email:' );
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    }
});

export { handler as GET, handler as POST };