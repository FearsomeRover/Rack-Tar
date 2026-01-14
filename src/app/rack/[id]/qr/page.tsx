import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { QRCodeDisplay } from "@/components/qr-code-display";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getRack(id: string) {
  return prisma.rack.findUnique({
    where: { id },
    select: { id: true, name: true, location: true, qrCode: true },
  });
}

export default async function QRCodePage({ params }: PageProps) {
  const { id } = await params;
  const rack = await getRack(id);

  if (!rack) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 print:hidden">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/rack/${rack.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="flex-1 text-2xl font-bold">QR Code: {rack.name}</h1>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md print:border-none print:shadow-none">
          <CardContent className="flex flex-col items-center p-8">
            <QRCodeDisplay rackId={rack.id} rackName={rack.name} />
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold">{rack.name}</h2>
              {rack.location && (
                <p className="text-muted-foreground">{rack.location}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground print:hidden">
        <p>Scan this QR code to view the contents of this rack.</p>
        <p className="mt-1">
          Or visit:{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            /rack/{rack.id}
          </code>
        </p>
      </div>
    </div>
  );
}
