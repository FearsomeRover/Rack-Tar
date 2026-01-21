"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/permissions";

export async function createItem(data: {
  name: string;
  description?: string;
  quantity: number;
  rackId: string;
}) {
  const user = await requireRole("EDITOR");

  const item = await prisma.item.create({
    data: {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      rackId: data.rackId,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_ITEM",
      userId: user.id,
      itemId: item.id,
      rackId: data.rackId,
      details: { name: data.name, quantity: data.quantity },
    },
  });

  revalidatePath(`/rack/${data.rackId}`);
  revalidatePath("/items");
  revalidatePath("/");
  return item;
}

export async function updateItem(
  id: string,
  data: { name?: string; description?: string; quantity?: number }
) {
  const user = await requireRole("EDITOR");

  const item = await prisma.item.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_ITEM",
      userId: user.id,
      itemId: item.id,
      rackId: item.rackId,
      details: data,
    },
  });

  revalidatePath(`/rack/${item.rackId}`);
  revalidatePath("/items");
  return item;
}

export async function deleteItem(id: string) {
  const user = await requireRole("EDITOR");

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  await prisma.auditLog.create({
    data: {
      action: "DELETE_ITEM",
      userId: user.id,
      rackId: item.rackId,
      details: { itemId: id, itemName: item.name },
    },
  });

  await prisma.item.delete({ where: { id } });
  revalidatePath(`/rack/${item.rackId}`);
  revalidatePath("/items");
  revalidatePath("/");
  return item;
}

export async function moveItem(id: string, newRackId: string) {
  const user = await requireRole("EDITOR");

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  const oldRackId = item.rackId;
  const updated = await prisma.item.update({
    where: { id },
    data: { rackId: newRackId },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_ITEM",
      userId: user.id,
      itemId: item.id,
      rackId: newRackId,
      details: { moved: true, fromRackId: oldRackId, toRackId: newRackId },
    },
  });

  revalidatePath(`/rack/${oldRackId}`);
  revalidatePath(`/rack/${newRackId}`);
  revalidatePath("/items");
  return updated;
}

export async function toggleItemRemoved(id: string) {
  const user = await requireRole("EDITOR");

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found");

  const updated = await prisma.item.update({
    where: { id },
    data: { removed: !item.removed },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE_ITEM",
      userId: user.id,
      itemId: item.id,
      rackId: item.rackId,
      details: { removed: updated.removed },
    },
  });

  revalidatePath(`/rack/${item.rackId}`);
  revalidatePath("/items");
  revalidatePath("/");
  return updated;
}
