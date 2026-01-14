"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createItem } from "@/lib/actions/item-actions";
import { toast } from "sonner";

interface AddItemFormProps {
  rackId: string;
}

export function AddItemForm({ rackId }: AddItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await createItem({
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        quantity: parseInt(formData.get("quantity") as string, 10),
        rackId,
      });
      toast.success("Item added");
      formRef.current?.reset();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" placeholder="Item name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Optional description"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          defaultValue="1"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Item"}
      </Button>
    </form>
  );
}
