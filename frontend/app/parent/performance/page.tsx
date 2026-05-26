"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ParentPerformance() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Academic Performance</h2>
        <p className="text-muted-foreground">Monitor grading indexes</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Grading Ratios</CardTitle>
          <CardDescription>Current academic status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Course Progress: <strong>{child?.progress}% Completed</strong></p>
        </CardContent>
      </Card>
    </div>
  );
}
