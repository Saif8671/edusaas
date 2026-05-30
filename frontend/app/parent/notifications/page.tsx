"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ParentNotifications() {
  const { notifications } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Notifications Log" description="Keep updated with school alerts" />

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
