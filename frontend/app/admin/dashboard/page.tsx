"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  CalendarDays,
  CircleDollarSign,
  GraduationCap,
  Megaphone,
  ShieldAlert,
  TrendingUp,
  Users,
  UserCog,
  CreditCard,
  BookOpen,
  ShoppingBag,
  BarChart3,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const chartData = [
  { month: "Jan", enrollments: 30, revenue: 12000, attendance: 90 },
  { month: "Feb", enrollments: 45, revenue: 18500, attendance: 88 },
  { month: "Mar", enrollments: 60, revenue: 24000, attendance: 92 },
  { month: "Apr", enrollments: 80, revenue: 32000, attendance: 95 },
  { month: "May", enrollments: 95, revenue: 41000, attendance: 93 },
  { month: "Jun", enrollments: 102, revenue: 46500, attendance: 94 },
];

const moduleCards = [
  {
    title: "Batches",
    description: "Create groups, assign faculty, and balance capacities.",
    href: "/admin/batches",
    icon: GraduationCap,
  },
  {
    title: "Faculty",
    description: "Recruit, update, and map teaching staff by subject.",
    href: "/admin/faculty",
    icon: UserCog,
  },
  {
    title: "Students",
    description: "Track enrollment, attendance, and parent mapping.",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Marketplace",
    description: "Create courses and sell them directly to students.",
    href: "/admin/marketplace",
    icon: ShoppingBag,
  },
  {
    title: "Certificates",
    description: "Issue, preview, and share completion certificates.",
    href: "/admin/certificates",
    icon: Award,
  },
  {
    title: "Payments",
    description: "Review invoices, dues, and revenue snapshots.",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Announcements",
    description: "Broadcast academic and operations updates to all roles.",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "Attendance",
    description: "Monitor daily and monthly attendance patterns.",
    href: "/admin/attendance",
    icon: CalendarDays,
  },
];

const quickActions = [
  { title: "Create Batch", description: "Set up a new cohort and schedule.", icon: GraduationCap, href: "/admin/batches" },
  { title: "Add Faculty", description: "Register a new instructor profile.", icon: UserCog, href: "/admin/faculty" },
  { title: "Add Student", description: "Enroll a student with parent mapping.", icon: Users, href: "/admin/students" },
  { title: "Create Course", description: "Open a new course for marketplace sales.", icon: BookOpen, href: "/admin/courses" },
  { title: "Issue Certificate", description: "Generate completion proof for graduates.", icon: Award, href: "/admin/certificates" },
  { title: "Send Announcement", description: "Notify every role with one post.", icon: Megaphone, href: "/admin/announcements" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { students, faculty, courses, batches, invoices, announcements } = useAppStore();

  const totalRevenue = courses.reduce((sum, course) => sum + course.price * Math.max(course.studentsEnrolled, 1), 0);
  const activeCourses = courses.filter((course) => course.published).length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "Paid").length;
  const averageAttendance = useMemo(
    () => Math.round(students.reduce((sum, student) => sum + student.attendancePct, 0) / Math.max(students.length, 1)),
    [students],
  );
  const lowAttendanceStudents = students.filter((student) => student.attendancePct < 75);

  const stats = [
    {
      title: "Students",
      value: students.length,
      detail: `${lowAttendanceStudents.length} require follow-up`,
      icon: Users,
      tone: "text-sky-500",
    },
    {
      title: "Faculty",
      value: faculty.length,
      detail: "Across departments and subjects",
      icon: UserCog,
      tone: "text-violet-500",
    },
    {
      title: "Batches",
      value: batches.length,
      detail: `${batches.reduce((sum, batch) => sum + batch.studentCount, 0)} enrolled learners`,
      icon: GraduationCap,
      tone: "text-amber-500",
    },
    {
      title: "Active Courses",
      value: activeCourses,
      detail: "Published to the marketplace",
      icon: BookOpen,
      tone: "text-emerald-500",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      detail: `${pendingInvoices} pending invoices`,
      icon: CircleDollarSign,
      tone: "text-emerald-600",
    },
    {
      title: "Attendance",
      value: `${averageAttendance}%`,
      detail: "Average across active learners",
      icon: BarChart3,
      tone: "text-rose-500",
    },
  ];

  const openRoute = (href: string) => router.push(href);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass-card rounded-[1.6rem]">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-tight">{stat.value}</CardTitle>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/60 ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Growth dashboard
            </CardTitle>
            <CardDescription>Enrollments, revenue, and attendance trends for the last six months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 14, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader>
            <CardTitle className="text-xl">Today&apos;s control queue</CardTitle>
            <CardDescription>High-priority admin tasks and operational flags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Attention required</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {lowAttendanceStudents.length} students are below the 75% attendance threshold.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Attendance health",
                  value: `${averageAttendance}%`,
                  meta: "Across current active learners",
                },
                {
                  label: "Pending invoices",
                  value: pendingInvoices.toString(),
                  meta: "Need follow-up in Payments",
                },
                {
                  label: "Announcements today",
                  value: announcements.length.toString(),
                  meta: "Broadcasts visible to every role",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Admin module launchpad</CardTitle>
              <CardDescription>Direct access to every major area in the notebook plan.</CardDescription>
            </div>
            <Badge variant="outline" className="rounded-full">
              8 modules
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {moduleCards.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.title}
                  onClick={() => openRoute(module.href)}
                  className="group rounded-[1.4rem] border border-border/60 bg-background/75 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{module.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader>
            <CardTitle className="text-xl">Quick actions</CardTitle>
            <CardDescription>Fast admin workflows inspired by the handwritten plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => openRoute(action.href)}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-background/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader>
            <CardTitle className="text-xl">Batch capacity overview</CardTitle>
            <CardDescription>Live view of cohorts and how close they are to capacity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {batches.map((batch) => {
              const fill = Math.min((batch.studentCount / batch.capacity) * 100, 100);
              return (
                <div key={batch.id} className="space-y-2 rounded-2xl border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{batch.name}</p>
                      <p className="text-sm text-muted-foreground">{batch.facultyName}</p>
                    </div>
                    <Badge variant="outline">{batch.status}</Badge>
                  </div>
                  <Progress value={fill} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{batch.studentCount} students enrolled</span>
                    <span>{batch.schedule}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-[1.6rem]">
          <CardHeader>
            <CardTitle className="text-xl">Recent announcements</CardTitle>
            <CardDescription>Latest messages ready for admin, faculty, student, and parent feeds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.slice(0, 4).map((announcement) => (
              <div key={announcement.id} className="rounded-2xl border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{announcement.title}</p>
                  <Badge variant="outline">{announcement.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{announcement.content}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{announcement.sender}</span>
                  <span>{announcement.date}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card rounded-[1.6rem]">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">At-risk students</CardTitle>
            <CardDescription>Students below the attendance threshold for admin follow-up.</CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full">
            {lowAttendanceStudents.length} flagged
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowAttendanceStudents.length > 0 ? (
                  lowAttendanceStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-28">
                            <Progress value={student.attendancePct} className="h-2" />
                          </div>
                          <span className="text-xs font-semibold">{student.attendancePct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-700">
                          Follow up
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No attendance alerts right now.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
