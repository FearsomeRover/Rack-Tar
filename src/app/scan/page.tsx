"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScanning() {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleQrResult(decodedText);
        },
        () => {}
      );

      setIsScanning(true);
    } catch {
      toast.error("Failed to start camera. Please check permissions.");
    }
  }

  async function stopScanning() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  }

  function handleQrResult(result: string) {
    stopScanning();

    // Extract rack ID from URL or use raw value
    let rackId = result;

    // Handle full URLs like https://domain.com/rack/uuid
    const urlMatch = result.match(/\/rack\/([a-f0-9-]+)/i);
    if (urlMatch) {
      rackId = urlMatch[1];
    }

    // Handle QR codes that are just UUIDs
    const uuidMatch = result.match(
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
    );
    if (uuidMatch) {
      rackId = result;
    }

    toast.success("QR code scanned!");
    router.push(`/rack/${rackId}`);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/rack/${manualId.trim()}`);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scan QR Code</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Camera Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id="qr-reader"
              ref={containerRef}
              className="overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
              style={{ minHeight: isScanning ? "300px" : "200px" }}
            >
              {!isScanning && (
                <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
                  <Camera className="mb-2 h-12 w-12" />
                  <p>Camera not active</p>
                </div>
              )}
            </div>

            {isScanning ? (
              <Button onClick={stopScanning} variant="outline" className="w-full">
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Scanning
              </Button>
            ) : (
              <Button onClick={startScanning} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rackId">Rack ID</Label>
                <Input
                  id="rackId"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter rack ID or paste URL"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Go to Rack
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
