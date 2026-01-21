import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./db";
import type { UserRole } from "@/generated/prisma/client";

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

// Group ID for automatic role assignment
const PRIVILEGED_GROUP_ID = 57;

interface PekMembership {
  id: number;
  name: string;
  title?: string[];
}

interface PekExecutive {
  id: number;
  name: string;
}

interface AuthSchProfile {
  sub: string;
  name?: string;
  email?: string;
  "pek.sch.bme.hu:activeMemberships/v1"?: PekMembership[];
  "pek.sch.bme.hu:executiveAt/v1"?: PekExecutive[];
}

function determineRole(profile: AuthSchProfile): UserRole {
  const executiveAt = profile["pek.sch.bme.hu:executiveAt/v1"] || [];
  const activeMemberships = profile["pek.sch.bme.hu:activeMemberships/v1"] || [];

  // Check if user is leader of group 57 → ADMIN
  if (executiveAt.some((group) => group.id === PRIVILEGED_GROUP_ID)) {
    return "ADMIN";
  }

  // Check if user is member of group 57 → EDITOR
  if (activeMemberships.some((group) => group.id === PRIVILEGED_GROUP_ID)) {
    return "EDITOR";
  }

  // Default role
  return "VIEWER";
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
          scope: "openid profile email pek.sch.bme.hu:profile",
        },
      },
    },
  ],
  callbacks: {
    async signIn({ profile }) {
      const authProfile = profile as AuthSchProfile | undefined;
      if (!authProfile?.sub) return false;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { authschId: authProfile.sub },
      });

      if (existingUser) {
        // Update name and email only (preserve existing role)
        await prisma.user.update({
          where: { authschId: authProfile.sub },
          data: {
            name: authProfile.name,
            email: authProfile.email,
          },
        });
      } else {
        // New user - determine role based on group membership
        const role = determineRole(authProfile);
        await prisma.user.create({
          data: {
            authschId: authProfile.sub,
            name: authProfile.name,
            email: authProfile.email,
            role,
          },
        });
      }

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
