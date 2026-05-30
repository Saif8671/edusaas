"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ParentAttendance() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Attendance Logs" description="Monitor attendance indexes" />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Attendance Sheets</CardTitle>
          <CardDescription>Track daily attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-semibold">Overall Attendance Index: {child?.attendancePct}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
