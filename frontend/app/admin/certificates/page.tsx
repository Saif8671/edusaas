"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ShieldCheck, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCertificates() {
  const { students } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Certificates Issued</h2>
        <p className="text-muted-foreground">Approve, preview, and track verified credentials issued to graduates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.filter(s => s.progress >= 80).map((student) => (
          <Card key={student.id} className="glass-card border bg-card/40 backdrop-blur-md flex flex-col justify-between">
            <CardHeader className="pb-3">
              <Award className="h-10 w-10 text-amber-500 mb-2" />
              <CardTitle className="text-lg">Certificate of Achievement</CardTitle>
              <CardDescription>Issued to: {student.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p><strong>Course Completed:</strong> {student.course}</p>
              <p><strong>Graduation Score:</strong> {student.progress}%</p>
              <p className="flex items-center gap-1.5 text-green-500 font-semibold mt-2">
                <ShieldCheck className="h-4 w-4" /> Blockchain Verified Credential
              </p>
            </CardContent>
            <div className="p-4 border-t flex gap-2">
              <Button size="sm" variant="outline" className="w-full gap-1 rounded-xl text-xs">
                <Download className="h-3.5 w-3.5" /> Preview
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl">
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
