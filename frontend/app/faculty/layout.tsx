"use client";

import { RoleGuard } from "@/components/role-guard";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["FACULTY"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
