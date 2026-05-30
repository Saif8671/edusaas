"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ParentPerformance() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Academic Performance" description="Monitor grading indexes" />

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
