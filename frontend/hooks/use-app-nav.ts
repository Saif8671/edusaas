"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export function useAppNav() {
  const router = useRouter();

  return (path: string, message?: string) => {
    if (message) toast.info(message);
    router.push(path);
  };
}
