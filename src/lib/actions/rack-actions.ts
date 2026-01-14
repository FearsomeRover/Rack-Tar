"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRacks() {
  return prisma.rack.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getRackByQrCode(qrCode: string) {
  return prisma.rack.findUnique({
    where: { qrCode },
    include: { items: { orderBy: { name: "asc" } } },
  });
}

export async function getRackById(id: string) {
  return prisma.rack.findUnique({
    where: { id },
    include: { items: { orderBy: { name: "asc" } } },
  });
}

export async function createRack(data: { name: string; location?: string }) {
  const rack = await prisma.rack.create({
    data: {
      name: data.name,
      location: data.location,
    },
  });
  revalidatePath("/racks");
  return rack;
}

export async function updateRack(
  id: string,
  data: { name?: string; location?: string }
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
