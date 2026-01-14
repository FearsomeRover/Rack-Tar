"use client";

import { useState } from "react";
import { Pencil, Trash2, Package, PackageMinus, PackagePlus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteItem, updateItem, toggleItemRemoved } from "@/lib/actions/item-actions";
import { toast } from "sonner";
import type { Item } from "@/generated/prisma/client";

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);

  const activeItems = items.filter((item) => !item.removed);
  const removedItems = items.filter((item) => item.removed);

  async function handleDelete(item: Item) {
    if (!confirm(`Permanently delete "${item.name}"?`)) return;

    try {
      await deleteItem(item.id);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  }

  async function handleToggleRemoved(item: Item) {
    try {
      await toggleItemRemoved(item.id);
      toast.success(item.removed ? "Item restored" : "Item removed");
    } catch {
      toast.error("Failed to update item");
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingItem) return;

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updateItem(editingItem.id, {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        quantity: parseInt(formData.get("quantity") as string, 10),
      });
      toast.success("Item updated");
      setEditingItem(null);
    } catch {
      toast.error("Failed to update item");
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Package className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No items in this rack</p>
        <p className="text-sm text-muted-foreground">
          Add items using the form on the right
        </p>
      </div>
    );
  }

  return (
    <>
      {activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No active items</p>
          <p className="text-sm text-muted-foreground">
            All items have been temporarily removed
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-24 text-right">Qty</TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.description || "-"}
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleRemoved(item)}
                      title="Remove temporarily"
                    >
                      <PackageMinus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item)}
                      title="Delete permanently"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {removedItems.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <button
            onClick={() => setShowRemoved(!showRemoved)}
            className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {showRemoved ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Temporarily removed ({removedItems.length})
          </button>

          {showRemoved && (
            <Table className="mt-2">
              <TableBody>
                {removedItems.map((item) => (
                  <TableRow key={item.id} className="opacity-60">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.description || "-"}
                    </TableCell>
                    <TableCell className="w-24 text-right">{item.quantity}</TableCell>
                    <TableCell className="w-28">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleRemoved(item)}
                          title="Restore"
                        >
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem(item)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingItem.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={editingItem.description || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={editingItem.quantity}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
