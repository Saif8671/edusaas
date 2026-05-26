"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function FacultyMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Channel Hub</h2>
        <p className="text-muted-foreground">Post message threads to specific courses, student channels, or parents</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <MessageSquare className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Messages Box</CardTitle>
          <CardDescription>Chat feeds and files attachments index</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground">
          No active messaging threads open. Use sidebar list search to contact students or parents.
        </CardContent>
      </Card>
    </div>
  );
}
