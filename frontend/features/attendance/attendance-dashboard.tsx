"use client";

import { useState } from "react";
import type { AttendanceDashboardProps } from "./types";
import { AdminAttendanceView } from "./admin-attendance-view";
import { FacultyAttendanceView } from "./faculty-attendance-view";
import StudentAttendance from "@/app/student/attendance/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users } from "lucide-react";

export function AttendanceDashboard(props: AttendanceDashboardProps) {
  const [activeTab, setActiveTab] = useState("class");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage class attendance and view your personal records.</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[340px]">
          <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-muted/50 backdrop-blur-md">
            <TabsTrigger value="class" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">
              <Users className="w-4 h-4 mr-2" />
              Class View
            </TabsTrigger>
            <TabsTrigger value="personal" className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">
              <CalendarDays className="w-4 h-4 mr-2" />
              My Attendance
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        {activeTab === "class" ? (
          props.mode === "faculty" ? (
            <FacultyAttendanceView {...props} />
          ) : (
            <AdminAttendanceView {...props} />
          )
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Render student attendance without its own page-shell padding if possible, or just reuse it */}
            <StudentAttendance standalone={false} />
          </div>
        )}
      </div>
    </div>
  );
}
