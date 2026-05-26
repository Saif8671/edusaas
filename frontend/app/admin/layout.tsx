"use client";

import { RoleGuard } from "@/components/role-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
