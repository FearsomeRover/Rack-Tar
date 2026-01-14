"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  rackId: string;
  rackName: string;
}

export function QRCodeDisplay({ rackId, rackName }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const url = `${window.location.origin}/rack/${rackId}`;

    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [rackId]);

  if (!qrDataUrl) {
    return (
      <div className="flex h-64 w-64 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <span className="text-muted-foreground">Generating...</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrDataUrl}
      alt={`QR Code for ${rackName}`}
      className="h-64 w-64"
    />
  );
}
