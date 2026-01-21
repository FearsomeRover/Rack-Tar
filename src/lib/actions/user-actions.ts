"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/generated/prisma/client";

export async function getUsers() {
  await requireRole("ADMIN");

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      authschId: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { auditLogs: true } },
    },
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await requireRole("ADMIN");

  // Prevent admin from demoting themselves
  if (userId === admin.id) {
    throw new Error("Cannot change your own role");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function deleteUser(userId: string) {
  const admin = await requireRole("ADMIN");

  // Prevent admin from deleting themselves
  if (userId === admin.id) {
    throw new Error("Cannot delete your own account");
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
