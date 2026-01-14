"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ItemsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const showRemoved = searchParams.get("showRemoved") === "true";

  function handleChange(checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("showRemoved", "true");
    } else {
      params.delete("showRemoved");
    }
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <label className={`flex items-center gap-2 text-sm ${isPending ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={showRemoved}
        onChange={(e) => handleChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      Show removed
    </label>
  );
}
