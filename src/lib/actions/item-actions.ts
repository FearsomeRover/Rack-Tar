"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createItem(data: {
  name: string;
  description?: string;
  quantity: number;
  rackId: string;
}) {
  const item = await prisma.item.create({
    data: {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      rackId: data.rackId,
    },
  });
  revalidatePath(`/rack/${data.rackId}`);
  return item;
}

export async function updateItem(
  id: string,
  data: { name?: string; description?: string; quantity?: number }
) {
  const item = await prisma.item.update({
    where: { id },
    data,
  });
  revalidatePath(`/rack/${item.rackId}`);
  return item;
}

export async function deleteItem(id: string) {
  const item = await prisma.item.delete({ where: { id } });
  revalidatePath(`/rack/${item.rackId}`);
  return item;
}

export async function moveItem(id: string, newRackId: string) {
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  const oldRackId = item.rackId;
  const updated = await prisma.item.update({
    where: { id },
    data: { rackId: newRackId },
  });

  revalidatePath(`/rack/${oldRackId}`);
  revalidatePath(`/rack/${newRackId}`);
  return updated;
}
