import NextAuth from "next-auth"
import prisma from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    if (!credentials?.username || !credentials?.password) {
                        return null;
                    }

                    const username = credentials.username as string;
                    const password = credentials.password as string;

                    const user = await prisma.user.findUnique({
                        where: { username },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        return null;
                    }

                    return user;
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
})
