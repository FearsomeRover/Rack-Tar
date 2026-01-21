"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole, getCurrentUser } from "@/lib/permissions";

export async function getRacks() {
  return prisma.rack.findMany({
    include: {
      location: true,
      _count: { select: { items: true } }
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRackByQrCode(qrCode: string) {
  return prisma.rack.findUnique({
    where: { qrCode },
    include: {
      location: true,
      items: { orderBy: { name: "asc" } }
    },
  });
}

export async function getRackById(id: string) {
  return prisma.rack.findUnique({
    where: { id },
    include: {
      location: true,
      items: { orderBy: { name: "asc" } }
    },
  });
}

export async function createRack(data: { name: string; locationId?: string }) {
  const user = await requireRole("EDITOR");

  const rack = await prisma.rack.create({
    data: {
      name: data.name,
      locationId: data.locationId || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_RACK",
      userId: user.id,
      rackId: rack.id,
      details: { name: data.name },
    },
  });

  revalidatePath("/racks");
  revalidatePath("/");
  return rack;
}

export async function updateRack(
  id: string,
  data: { name?: string; locationId?: string | null }
) {
  const user = await requireRole("EDITOR");

  const rack = await prisma.rack.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_RACK",
      userId: user.id,
      rackId: rack.id,
      details: data,
    },
  });

  revalidatePath("/racks");
  revalidatePath(`/rack/${id}`);
  revalidatePath("/");
  return rack;
}

export async function deleteRack(id: string) {
  const user = await requireRole("EDITOR");

  const rack = await prisma.rack.findUnique({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE_RACK",
      userId: user.id,
      details: { rackId: id, rackName: rack?.name },
    },
  });

  await prisma.rack.delete({ where: { id } });
  revalidatePath("/racks");
  revalidatePath("/");
}
