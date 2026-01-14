"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  const rack = await prisma.rack.create({
    data: {
      name: data.name,
      locationId: data.locationId || null,
    },
  });
  revalidatePath("/racks");
  return rack;
}

export async function updateRack(
  id: string,
  data: { name?: string; locationId?: string | null }
) {
  const rack = await prisma.rack.update({
    where: { id },
    data,
  });
  revalidatePath("/racks");
  revalidatePath(`/rack/${id}`);
  return rack;
}

export async function deleteRack(id: string) {
  await prisma.rack.delete({ where: { id } });
  revalidatePath("/racks");
}
