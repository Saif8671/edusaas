"use client";

import { useAppStore } from "@/lib/store";
import { 
  BookOpen, Compass, Award, CalendarDays, AlertTriangle, CheckCircle, 
  HelpCircle, Sparkles, Send, PlayCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { students, courses, assignments, submitAssignment, addNotification } = useAppStore();

  const studentProfile = students.find(s => s.id === "STU-001") || students[0];
  const pendingAssignments = assignments.filter(a => a.status === "Pending");

  const handleSubmit = (id: string, name: string) => {
    submitAssignment(id);
    addNotification("Assignment Submitted", `Successfully uploaded your work for ${name}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-2xl border border-primary/20 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Welcome back, {studentProfile?.name}! <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </h2>
          <p className="text-muted-foreground text-sm">Keep up the great work! You're in the top 10% of your class this term.</p>
        </div>
      </div>

      {/* Top Cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Course</div>
            <p className="text-[10px] text-muted-foreground mt-1">Advanced Quantum</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Progress %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProfile?.progress}%</div>
            <p className="text-[10px] text-green-500 font-semibold mt-1">Level 4 unlocked</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Assignments Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments.length} Tasks</div>
            <p className="text-[10px] text-red-500 font-semibold mt-1">Due soon</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Issued</div>
            <p className="text-[10px] text-muted-foreground mt-1">Requires 80% progress</p>
          </CardContent>
        </Card>

        <Card className="glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProfile?.attendancePct}%</div>
            <p className="text-[10px] text-green-500 font-semibold mt-1">Above school minimum</p>
          </CardContent>
        </Card>

      </div>

      {/* Warnings & Timeline Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course Modules Timeline */}
        <Card className="lg:col-span-2 glass-card border bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Syllabus Learning Timeline</CardTitle>
            <CardDescription>Track completed lectures and unlocked level pathways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative before:absolute before:left-7 before:top-8 before:h-[70%] before:w-0.5 before:bg-muted">
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white font-bold text-xs">✓</div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Module 1: Schrödinger Equation Basics</h4>
                <p className="text-xs text-muted-foreground">Lectures 1-4 completed. Homework graded A+.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white font-bold text-xs">✓</div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Module 2: Quantum States & Wave Functions</h4>
                <p className="text-xs text-muted-foreground">Lectures 5-8 completed. Exam scorecard uploaded.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs animate-pulse">3</div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-primary">Module 3: Particle in a Box (In Progress)</h4>
                <p className="text-xs text-muted-foreground">Upcoming lecture scheduled Mon 10:00 AM.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-xs">4</div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-muted-foreground">Module 4: Quantum Entanglements (Locked)</h4>
                <p className="text-xs text-muted-foreground">Unlocks when Module 3 progress reaches 100%.</p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Right Side: Quick Submit Assignments & Low attendance warning */}
        <div className="space-y-6">
          
          {studentProfile?.attendancePct < 75 && (
            <Card className="border border-red-500/30 bg-red-500/5 backdrop-blur-md text-red-500">
              <CardHeader className="flex flex-row items-center gap-3 pb-2 space-y-0">
                <AlertTriangle className="h-6 w-6 text-red-500 animate-bounce" />
                <CardTitle className="text-sm font-bold text-red-500">Attendance Alert</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p>Your current attendance score ({studentProfile.attendancePct}%) sits below the academy threshold of 75%.</p>
                <p className="font-semibold">Failure to attend upcoming slots will restrict final term exam registration.</p>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card border bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Instant Submission Desk</CardTitle>
              <CardDescription>Upload files for pending assignments directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((asm) => (
                  <div key={asm.id} className="p-3 border rounded-xl hover:bg-muted/30 transition-all space-y-2">
                    <div className="text-xs">
                      <span className="font-semibold block">{asm.title}</span>
                      <span className="text-[10px] text-muted-foreground">Due: {asm.deadline}</span>
                    </div>
                    <Button size="sm" onClick={() => handleSubmit(asm.id, asm.title)} className="w-full rounded-xl gap-1 h-9">
                      <Send className="h-3.5 w-3.5" /> Upload & Submit PDF
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No assignments are pending submission. You're fully caught up!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
