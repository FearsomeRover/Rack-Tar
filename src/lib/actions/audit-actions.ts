"use server";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export async function getAuditLogs(limit = 100) {
  await requireRole("ADMIN");

  return prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      rack: { select: { id: true, name: true } },
      item: { select: { id: true, name: true } },
    },
  });
}
