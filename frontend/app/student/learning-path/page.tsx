"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Compass, CheckCircle2 } from "lucide-react";

export default function StudentLearningPath() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interactive Learning Roadmap</h2>
        <p className="text-muted-foreground">Follow structured steps to unlock skills badges</p>
      </div>

      <Card className="glass-card border bg-card/40 backdrop-blur-md">
        <CardHeader>
          <Compass className="h-8 w-8 text-primary mb-2" />
          <CardTitle>Milestone Curriculum Map</CardTitle>
          <CardDescription>Achieve milestones to verify credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5" /> Module 1: Complete Basics (Unlocked & Verified)
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 animate-pulse" /> Module 2: Quantum Physics (In Progress)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
