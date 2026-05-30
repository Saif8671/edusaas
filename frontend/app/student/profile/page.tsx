"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentProfile() {
  const { currentUser } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Student Profile" description="View your academic credentials" />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><strong>Name:</strong> {currentUser?.name}</p>
          <p><strong>Email Address:</strong> {currentUser?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
