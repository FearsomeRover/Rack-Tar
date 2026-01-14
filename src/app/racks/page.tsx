import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { RackCard } from "@/components/rack-card";
import { SearchInput } from "@/components/search-input";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function getRacks(query?: string) {
  return prisma.rack.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      location: true,
      _count: { select: { items: { where: { removed: false } } } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function RacksPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const racks = await getRacks(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Racks</h1>
        <Button asChild>
          <Link href="/racks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Rack
          </Link>
        </Button>
      </div>

      <SearchInput placeholder="Search racks..." />

      {racks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              {q ? `No racks found for "${q}"` : "No racks yet"}
            </p>
            {!q && (
              <Button asChild>
                <Link href="/racks/new">Create your first rack</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {racks.map((rack) => (
            <RackCard key={rack.id} rack={rack} />
          ))}
        </div>
      )}
    </div>
  );
}
