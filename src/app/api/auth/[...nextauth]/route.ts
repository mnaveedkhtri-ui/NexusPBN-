import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { initDB } from "@/lib/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await initDB();
          const userResult = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;
          
          if (userResult.rows.length === 0) {
            return null; // User not found
          }

          const user = userResult.rows[0];
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "nexus_pbn_super_secret_key_2026_change_me",
});

export { handler as GET, handler as POST };
