import { PrismaClient } from "@prisma/client";
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        try {
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials?.email },
                { username: credentials?.email }, // If username is used as an identifier
              ],
            },
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          // Check if password is correct
          let isPasswordCorrect;
          if (credentials) {
            isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
          }

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err) {
          // throw new Error(err.message || "Authentication failed");
          const errorMessage =
            (err as Error).message || "Authentication failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
