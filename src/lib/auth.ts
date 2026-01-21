import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "VIEWER" | "EDITOR" | "ADMIN";
    };
  }
}

const config: NextAuthConfig = {
  providers: [
    {
      id: "authsch",
      name: "AuthSCH",
      type: "oidc",
      issuer: "https://auth.sch.bme.hu",
      clientId: process.env.AUTHSCH_CLIENT_ID!,
      clientSecret: process.env.AUTHSCH_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    },
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub) return false;

      // Create or update user in database
      await prisma.user.upsert({
        where: { authschId: profile.sub },
        update: {
          name: profile.name as string | undefined,
          email: profile.email as string | undefined,
        },
        create: {
          authschId: profile.sub,
          name: profile.name as string | undefined,
          email: profile.email as string | undefined,
          role: "VIEWER",
        },
      });

      return true;
    },
    async jwt({ token, profile }) {
      if (profile?.sub) {
        token.authschId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.authschId) {
        const dbUser = await prisma.user.findUnique({
          where: { authschId: token.authschId as string },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
