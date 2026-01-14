"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRack } from "@/lib/actions/rack-actions";
import { toast } from "sonner";

interface DeleteRackButtonProps {
  rackId: string;
  rackName: string;
}

export function DeleteRackButton({ rackId, rackName }: DeleteRackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${rackName}"? This will also delete all items in this rack.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteRack(rackId);
      toast.success("Rack deleted");
      router.push("/racks");
    } catch {
      toast.error("Failed to delete rack");
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isLoading ? "Deleting..." : "Delete"}
    </Button>
  );
}
