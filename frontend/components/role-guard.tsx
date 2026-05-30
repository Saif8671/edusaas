"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, RoleType } from "@/lib/store";
import { LoadingShell } from "@/components/app/loading-shell";
import { routes } from "@/lib/routes";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, activeRole } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const isAuthPath =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname === "/";

    if (!currentUser && !isAuthPath) {
      router.push(routes.login);
      return;
    }

    if (currentUser && allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
      router.push(routes[activeRole.toLowerCase() as "admin" | "faculty" | "student" | "parent"].dashboard);
    }
  }, [currentUser, activeRole, pathname, mounted, allowedRoles, router]);

  if (!mounted) {
    return <LoadingShell label="Checking access…" />;
  }

  const isAuthPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname === "/";

  if (!currentUser && !isAuthPath) {
    return <LoadingShell label="Redirecting to sign in…" />;
  }

  if (currentUser && allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
    return <LoadingShell label="Redirecting to your workspace…" />;
  }

  return <>{children}</>;
}
