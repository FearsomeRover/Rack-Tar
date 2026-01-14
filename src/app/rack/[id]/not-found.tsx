import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RackNotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Rack Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The rack you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/racks">View All Racks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/scan">Scan QR Code</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
