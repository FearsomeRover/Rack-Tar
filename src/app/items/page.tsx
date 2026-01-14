import Link from "next/link";
import { Package, MapPin, Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { SearchInput } from "@/components/search-input";
import { ItemsFilter } from "@/components/items-filter";

interface PageProps {
  searchParams: Promise<{ q?: string; showRemoved?: string }>;
}

async function getItems(query?: string, showRemoved?: boolean) {
  return prisma.item.findMany({
    where: {
      AND: [
        showRemoved ? {} : { removed: false },
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { rack: { name: { contains: query, mode: "insensitive" } } },
                { rack: { location: { name: { contains: query, mode: "insensitive" } } } },
              ],
            }
          : {},
      ],
    },
    include: {
      rack: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
    orderBy: [{ rack: { name: "asc" } }, { name: "asc" }],
  });
}

export default async function ItemsPage({ searchParams }: PageProps) {
  const { q, showRemoved } = await searchParams;
  const items = await getItems(q, showRemoved === "true");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Items</h1>
        <ItemsFilter />
      </div>

      <SearchInput placeholder="Search items, racks, or locations..." />

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Box className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {q ? `No items found for "${q}"` : "No items yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20 text-right">Qty</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.removed ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/rack/${item.rack.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                      {item.removed && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (removed)
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>
                    <Link
                      href={`/rack/${item.rack.id}`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Package className="h-3 w-3" />
                      {item.rack.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.rack.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.rack.location.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"} found
      </p>
    </div>
  );
}
