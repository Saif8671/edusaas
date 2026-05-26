"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function StudentCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <p className="text-muted-foreground">Monitor schedule logs and slot events</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <Calendar className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Schedule Calendar</CardTitle>
          <CardDescription>View upcoming exams, holidays, and classes</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground">
          No calendar events registered this week.
        </CardContent>
      </Card>
    </div>
  );
}
