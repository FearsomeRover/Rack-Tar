import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { canEdit } from "@/lib/permissions";
import { ItemList } from "@/components/item-list";
import { AddItemForm } from "@/components/add-item-form";
import { DeleteRackButton } from "@/components/delete-rack-button";
import { EditRackButton } from "@/components/edit-rack-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRack(id: string) {
  return prisma.rack.findUnique({
    where: { id },
    include: {
      location: true,
      items: { orderBy: { name: "asc" } },
    },
  });
}

export default async function RackPage({ params }: PageProps) {
  const { id } = await params;
  const [rack, userCanEdit] = await Promise.all([getRack(id), canEdit()]);

  if (!rack) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/racks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{rack.name}</h1>
          {rack.location && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {rack.location.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {userCanEdit && (
            <EditRackButton
              rackId={rack.id}
              rackName={rack.name}
              rackLocationId={rack.locationId}
            />
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/rack/${rack.id}/qr`}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Link>
          </Button>
          {userCanEdit && (
            <DeleteRackButton rackId={rack.id} rackName={rack.name} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={userCanEdit ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items ({rack.items.filter(i => !i.removed).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemList items={rack.items} canEdit={userCanEdit} />
            </CardContent>
          </Card>
        </div>

        {userCanEdit && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Item</CardTitle>
              </CardHeader>
              <CardContent>
                <AddItemForm rackId={rack.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
