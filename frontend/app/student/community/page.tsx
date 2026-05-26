"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function StudentCommunity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Chatrooms</h2>
        <p className="text-muted-foreground">Collaborate on assignments and chat with mentors</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <MessageSquare className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Batch Chat Rooms</CardTitle>
          <CardDescription>Join active discussion threads</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground">
          Welcome to the student channel! Chat lists are loading...
        </CardContent>
      </Card>
    </div>
  );
}
