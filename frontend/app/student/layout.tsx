"use client";

import { RoleGuard } from "@/components/role-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
