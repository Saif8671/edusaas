"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function ParentCertificates() {
  const { students } = useAppStore();
  const child = students.find(s => s.parentName === "A. Rahman") || students[0];

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Verified Credentials" description="Preview graduation badges achieved by dependents" />

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
