"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ParentChildren() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Children Directory</h2>
        <p className="text-muted-foreground">Manage details for dependents</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>{child?.name}</CardTitle>
          <CardDescription>Batch: {child?.batch}</CardDescription>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p><strong>Enrolled Course:</strong> {child?.course}</p>
          <p><strong>Status:</strong> {child?.status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
