"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createLocation(name: string) {
  const location = await prisma.location.create({
    data: { name },
  });
  revalidatePath("/racks");
  revalidatePath("/racks/new");
  return location;
}

export async function deleteLocation(id: string) {
  await prisma.location.delete({ where: { id } });
  revalidatePath("/racks");
}
