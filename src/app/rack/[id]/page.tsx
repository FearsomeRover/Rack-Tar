import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { ItemList } from "@/components/item-list";
import { AddItemForm } from "@/components/add-item-form";
import { DeleteRackButton } from "@/components/delete-rack-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRack(id: string) {
  return prisma.rack.findUnique({
    where: { id },
    include: { items: { orderBy: { name: "asc" } } },
  });
}

export default async function RackPage({ params }: PageProps) {
  const { id } = await params;
  const rack = await getRack(id);

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
              {rack.location}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/rack/${rack.id}/qr`}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Link>
          </Button>
          <DeleteRackButton rackId={rack.id} rackName={rack.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items ({rack.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemList items={rack.items} />
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  );
}
