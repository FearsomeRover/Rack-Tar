import Link from "next/link";
import { Package, Box, QrCode, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { RackCard } from "@/components/rack-card";

async function getStats() {
  const [rackCount, itemCount, recentRacks] = await Promise.all([
    prisma.rack.count(),
    prisma.item.count({ where: { removed: false } }),
    prisma.rack.findMany({
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: {
        location: true,
        _count: { select: { items: { where: { removed: false } } } },
      },
    }),
  ]);
  return { rackCount, itemCount, recentRacks };
}

export default async function Dashboard() {
  const { rackCount, itemCount, recentRacks } = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR
            </Link>
          </Button>
          <Button asChild>
            <Link href="/racks/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Rack
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Racks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rackCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemCount}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Racks</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/racks">View all</Link>
          </Button>
        </div>
        {recentRacks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No racks yet</p>
              <Button asChild>
                <Link href="/racks/new">Create your first rack</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentRacks.map((rack) => (
              <RackCard key={rack.id} rack={rack} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
