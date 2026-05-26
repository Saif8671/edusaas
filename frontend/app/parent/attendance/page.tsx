"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ParentAttendance() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Logs</h2>
        <p className="text-muted-foreground">Monitor attendance indexes</p>
      </div>

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
