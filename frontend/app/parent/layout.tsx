"use client";

import { RoleGuard } from "@/components/role-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["PARENT"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
