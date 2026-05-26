"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ParentSettings() {
  const { currentUser } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parent Configs</h2>
        <p className="text-muted-foreground">Adjust notifications and dependent parameters</p>
      </div>

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
