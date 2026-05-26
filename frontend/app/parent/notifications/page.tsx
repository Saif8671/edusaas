"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ParentNotifications() {
  const { notifications } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications Log</h2>
        <p className="text-muted-foreground">Keep updated with school alerts</p>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <Card key={n.id} className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center gap-4 py-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold">{n.title}</CardTitle>
                <CardDescription className="text-xs">{n.message} • {n.time}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
