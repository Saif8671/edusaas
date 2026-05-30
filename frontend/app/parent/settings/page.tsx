"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ParentSettings() {
  const { currentUser } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Parent Configs" description="Adjust notifications and dependent parameters" />

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Parent Settings</CardTitle>
          <CardDescription>Update your credentials details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><strong>Name:</strong> {currentUser?.name}</p>
          <p><strong>Work Address:</strong> {currentUser?.email}</p>
          <Button className="rounded-xl">Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
