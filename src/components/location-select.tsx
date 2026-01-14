"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getLocations, createLocation } from "@/lib/actions/location-actions";
import { toast } from "sonner";
import type { Location } from "@/generated/prisma/client";

interface LocationSelectProps {
  value?: string;
  onChange: (locationId: string | undefined) => void;
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    setIsCreating(true);
    try {
      const location = await createLocation(newLocationName.trim());
      setLocations((prev) => [...prev, location].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(location.id);
      setNewLocationName("");
      setDialogOpen(false);
      toast.success("Location created");
    } catch {
      toast.error("Failed to create location");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val === "none" ? undefined : val)}
        disabled={isLoading}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select location"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No location</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLocation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="e.g., Warehouse A, Room 101"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
