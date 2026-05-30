"use client";

import { isDemoMode } from "@/lib/demo";
import { BRAND_NAME } from "@/lib/brand";

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-900 dark:text-amber-200"
    >
      <span className="font-semibold">{BRAND_NAME} demo</span>
      <span className="text-amber-800/80 dark:text-amber-200/80">
        {" "}
        — sample data only. Backend integration comes later.
      </span>
    </div>
  );
}
