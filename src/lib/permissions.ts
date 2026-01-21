import { auth } from "./auth";
import { UserRole } from "@/generated/prisma/client";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
};

const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
};

/**
 * Get the current authenticated user, or null if not logged in
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication - throws if not logged in
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Require a minimum role level - throws if user doesn't have permission
 */
export async function requireRole(minRole: UserRole): Promise<SessionUser> {
  const user = await requireAuth();
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

/**
 * Check if user has at least the specified role (without throwing)
 */
export async function hasRole(minRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Check if user can edit (EDITOR or ADMIN)
 */
export async function canEdit(): Promise<boolean> {
  return hasRole("EDITOR");
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}
