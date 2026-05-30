"use client";
import { PageHeader } from "@/components/app/page-header";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentCertificates() {
  const { students } = useAppStore();
  const profile = students.find(s => s.id === "STU-001") || students[0];

  return (
    <div className="page-shell">
      <PageHeader hideTitle title="Certificates Registry" description="Download blockchain-verified credentials for completed courses" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile?.progress >= 80 ? (
          <Card className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <Award className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle>Graduation Certificate</CardTitle>
              <CardDescription>{profile.course}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="flex items-center gap-1 text-green-500 font-semibold"><ShieldCheck className="h-4 w-4" /> Blockchain Verified Key</p>
              <Button size="sm" variant="outline" className="w-full gap-1 rounded-xl"><Download className="h-4 w-4" /> Download PDF</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border bg-card/40 backdrop-blur-md">
            <CardContent className="py-8 text-center text-xs text-muted-foreground">
              You must reach 80% course progress to unlock your verified certificate. Currently at: {profile?.progress || 0}%.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
