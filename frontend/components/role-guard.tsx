"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore, RoleType } from "@/lib/store";
import { Loader2 } from "lucide-react";

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

    // If not logged in and not on auth paths, redirect to login
    const isAuthPath = pathname.startsWith("/login") || 
                       pathname.startsWith("/register") || 
                       pathname.startsWith("/forgot-password") ||
                       pathname === "/";

    if (!currentUser && !isAuthPath) {
      router.push("/login");
      return;
    }

    // If logged in but accessing a page not allowed for their activeRole
    if (currentUser && allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
      // Redirect to correct dashboard based on role
      const dashRedirect = activeRole.toLowerCase();
      router.push(`/${dashRedirect}/dashboard`);
    }
  }, [currentUser, activeRole, pathname, mounted, allowedRoles, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
