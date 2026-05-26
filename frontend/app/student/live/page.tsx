"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export default function StudentLive() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Live Session</h2>
        <p className="text-muted-foreground">Join scheduled live broadcasts</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <Video className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Join Live Classroom Room</CardTitle>
          <CardDescription>Zoom or Meet conference logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Next class: Physics Seminar at 10:00 AM (Mon)</p>
          <Button className="rounded-xl w-full">Join Meeting Room</Button>
        </CardContent>
      </Card>
    </div>
  );
}
