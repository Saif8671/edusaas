"use client";

import { useAppStore } from "@/lib/store";
import { 
  BookOpen, GraduationCap, Users, FileQuestion, CalendarDays,
  CheckCircle, ShieldAlert, Award, Video, FileText, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FacultyDashboard() {
  const { students, courses, batches, assignments, gradeAssignment, addNotification } = useAppStore();

  const activeAssignments = assignments.filter(a => a.status === "Submitted");

  const handleGrade = (id: string, name: string) => {
    gradeAssignment(id, "A+", "Superb solution layout!");
    addNotification("Grade Submitted", `Successfully evaluated ${name}'s project`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Faculty Intelligence Panel</h2>
        <p className="text-muted-foreground">Monitor assigned courses, evaluate student projects, and generate QR attendance keys</p>
      </div>

      {/* Top Cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.published).length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">2 Specializations</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">QC-2026, AI-Alpha</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Students Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-[10px] text-green-500 font-semibold mt-1">84% Average Activity</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Assignments Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-[10px] text-yellow-500 font-semibold mt-1">Requires review</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Classes Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Slots</div>
            <p className="text-[10px] text-primary font-semibold mt-1">Next: 10:00 AM</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Grade Submissions */}
        <Card className="lg:col-span-2 glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Assess Incoming Submissions</CardTitle>
            <CardDescription>Click to instantly grade student homework exercises</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAssignments.length > 0 ? (
              activeAssignments.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-muted/30 transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary font-semibold">{item.course}</span>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <span className="text-xs text-muted-foreground block">Deadline: {item.deadline}</span>
                  </div>
                  <Button size="sm" onClick={() => handleGrade(item.id, item.title)} className="rounded-xl">
                    Approve & Grade A+
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                All submitted assignments are fully evaluated.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Dynamic QR Attendance Integration & Live Classes */}
        <Card className="glass-card border bg-card/40 backdrop-blur-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Session Attendance QR Key</CardTitle>
            <CardDescription>Generate dynamic passcodes for manual/live updates</CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-6 gap-3 border-y bg-muted/10">
            <div className="p-3 bg-white rounded-2xl shadow-inner border border-primary/20">
              {/* QR Simulator */}
              <svg viewBox="0 0 100 100" className="h-28 w-28 text-slate-950">
                <rect width="25" height="25" fill="currentColor" />
                <rect x="75" width="25" height="25" fill="currentColor" />
                <rect y="75" width="25" height="25" fill="currentColor" />
                <rect x="35" y="35" width="30" height="30" fill="currentColor" />
                <rect x="10" y="45" width="10" height="10" fill="currentColor" />
                <rect x="45" y="10" width="10" height="10" fill="currentColor" />
                <rect x="80" y="80" width="15" height="15" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-primary">BATCH-QC-PASSCODE</span>
          </CardContent>

          <div className="p-4 flex gap-2">
            <Button size="sm" variant="outline" className="w-full rounded-xl text-xs gap-1.5 h-10">
              <Video className="h-4 w-4 text-red-500" /> Start Google Meet
            </Button>
          </div>
        </Card>

      </div>

    </div>
  );
}
