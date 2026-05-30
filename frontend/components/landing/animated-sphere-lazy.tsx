"use client";

import dynamic from "next/dynamic";

export const AnimatedSphereLazy = dynamic(
  () => import("./animated-sphere").then((mod) => mod.AnimatedSphere),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-full bg-muted/40" aria-hidden />
    ),
  },
);
