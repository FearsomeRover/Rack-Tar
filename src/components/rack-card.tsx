import Link from "next/link";
import { MapPin, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rack } from "@/generated/prisma";

type RackWithCount = Rack & {
  _count: { items: number };
};

interface RackCardProps {
  rack: RackWithCount;
}

export function RackCard({ rack }: RackCardProps) {
  return (
    <Link href={`/rack/${rack.id}`}>
      <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{rack.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {rack.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{rack.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span>
              {rack._count.items} {rack._count.items === 1 ? "item" : "items"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
