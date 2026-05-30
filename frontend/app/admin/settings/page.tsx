"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Bell, Key, Settings, Sparkles } from "lucide-react";

export default function AdminSettings() {
  const { currentUser } = useAppStore();

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="System Preferences" description="Adjust security rules, SMTP credentials, and toggle layout behaviors" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>System Information</CardTitle>
            <CardDescription>Details about your current user credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Logon ID:</span>
              <span className="font-semibold">{currentUser?.id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Assigned Role:</span>
              <span className="font-semibold text-primary">{currentUser?.role}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold">{currentUser?.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <Bell className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle>Global Preferences</CardTitle>
            <CardDescription>Simulated variables for school dashboard layout settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Enable Registration</span>
                <span className="text-xs text-muted-foreground">Allow new student profile signups</span>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Auto-Grade Assignments</span>
                <span className="text-xs text-muted-foreground">Grade simple code projects using AI models</span>
              </div>
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary" />
            </div>
            
            <Button className="w-full rounded-xl">Save Preference Toggles</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
