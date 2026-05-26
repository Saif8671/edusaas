"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function ParentCertificates() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verified Credentials</h2>
        <p className="text-muted-foreground">Preview graduation badges achieved by dependents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {child?.progress >= 80 ? (
          <Card className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <Award className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle>Graduation Certificate Approved</CardTitle>
              <CardDescription>{child.course}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="glass-card border bg-card/40 backdrop-blur-md">
            <CardContent className="py-8 text-center text-xs text-muted-foreground">
              Dependent has not completed curriculum milestones yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
