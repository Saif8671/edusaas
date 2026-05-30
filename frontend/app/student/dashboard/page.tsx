"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/app/page-header";
import { StatTile } from "@/components/app/stat-tile";
import { toast } from "@/lib/toast";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  BookOpen,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  Sparkles,
  Target,
  Trophy,
  UserCircle2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TopicItem = {
  name: string;
  percent: number;
  status: string;
  tone: string;
};

type RecommendationItem = {
  title: string;
  category: string;
  reason: string;
  duration: string;
  action: string;
  tone: string;
};

type PlanItem = {
  label: string;
  course: string;
  tone: string;
  action: string;
};

function ProgressBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className={`h-2 rounded-full ${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {action && onAction ? (
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-3 text-sm text-primary hover:bg-primary/10"
          onClick={onAction}
        >
          {action}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function BarIcon({ title }: { title: string }) {
  if (title.includes("Linear")) return <LineChart className="h-6 w-6" />;
  if (title.includes("Functions")) return <LayoutDashboard className="h-6 w-6" />;
  if (title.includes("Chemical")) return <GraduationCap className="h-6 w-6" />;
  return <UserCircle2 className="h-6 w-6" />;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { currentUser, students, assignments } = useAppStore();

  const studentProfile = students.find((student) => student.id === currentUser?.id) ?? students[0];
  const firstName = studentProfile?.name?.split(" ")[0] ?? "Student";
  const currentCourse = studentProfile?.course ?? "Your course";
  const pendingAssignments = assignments.filter((assignment) => assignment.status === "Pending");
  const todaysGoalCount = Math.min(3, Math.max(1, pendingAssignments.length + 1));
  const overallProgress = studentProfile?.progress ?? 0;

  const masteryTopics: TopicItem[] = currentCourse.includes("Quantum")
    ? [
        { name: "Quantum Mechanics", percent: 80, status: "Strong", tone: "bg-emerald-500" },
        { name: "Linear Algebra", percent: 65, status: "Good", tone: "bg-emerald-500" },
        { name: "Probability", percent: 45, status: "Weak", tone: "bg-amber-500" },
        { name: "Research Writing", percent: 30, status: "Needs Focus", tone: "bg-rose-500" },
      ]
    : currentCourse.includes("Artificial Intelligence")
      ? [
          { name: "Neural Networks", percent: 82, status: "Strong", tone: "bg-emerald-500" },
          { name: "Python", percent: 71, status: "Good", tone: "bg-emerald-500" },
          { name: "Math Foundations", percent: 54, status: "Weak", tone: "bg-amber-500" },
          { name: "Model Tuning", percent: 36, status: "Needs Focus", tone: "bg-rose-500" },
        ]
      : [
          { name: "Algorithms", percent: 78, status: "Strong", tone: "bg-emerald-500" },
          { name: "Data Structures", percent: 66, status: "Good", tone: "bg-emerald-500" },
          { name: "Problem Solving", percent: 49, status: "Weak", tone: "bg-amber-500" },
          { name: "Timed Practice", percent: 34, status: "Needs Focus", tone: "bg-rose-500" },
        ];

  const recommendations: RecommendationItem[] = [
    {
      title: "Linear Equations in Two Variables",
      category: "Mathematics",
      reason: "You scored 60% in your previous quiz, so a short revision loop will lift your next attempt.",
      duration: "~ 25 min",
      action: "Start Learning",
      tone: "from-indigo-500 to-violet-500",
    },
    {
      title: "Functions and Their Types",
      category: "Computer Science",
      reason: "This topic unlocks the next chapter in your course map and supports your assignments.",
      duration: "~ 20 min",
      action: "Start Learning",
      tone: "from-emerald-500 to-teal-500",
    },
    {
      title: "Chemical Bonding",
      category: "Chemistry",
      reason: "You are close to mastery, so a practice run will reinforce the next concept.",
      duration: "~ 18 min",
      action: "Continue",
      tone: "from-amber-500 to-orange-500",
    },
    {
      title: "Reading Comprehension",
      category: "English",
      reason: "A quick drill here will keep your exam accuracy steady across all subjects.",
      duration: "~ 15 min",
      action: "Practice Now",
      tone: "from-sky-500 to-blue-500",
    },
  ];

  const studyPlan: PlanItem[] = [
    { label: "Today", course: "Linear Equations in Two Variables", tone: "bg-emerald-500 text-white", action: "Completed" },
    { label: "Next", course: "Functions and Their Types", tone: "bg-indigo-600 text-white", action: "Start" },
    { label: "Later", course: "Chemical Bonding", tone: "bg-slate-200 text-slate-700", action: "Start" },
    { label: "Later", course: "Reading Comprehension", tone: "bg-slate-200 text-slate-700", action: "Start" },
  ];

  const assessments = [
    { title: "Math Quiz - Algebra", time: "21 May 2026, 10:00 AM", due: "2 Days Left", tone: "bg-indigo-50 text-indigo-700" },
    { title: "Physics Assignment", time: "23 May 2026, 11:59 PM", due: "4 Days Left", tone: "bg-emerald-50 text-emerald-700" },
    { title: "Chemistry Test", time: "25 May 2026, 9:00 AM", due: "6 Days Left", tone: "bg-amber-50 text-amber-700" },
  ];

  const go = (path: string, message?: string) => {
    if (message) toast.info(message);
    router.push(path);
  };

  return (
    <div className="page-shell relative isolate">
      <PageHeader
        hideTitle
        eyebrow={`Good morning, ${firstName}`}
        title="Dashboard"
        description={`${currentCourse} · ${studentProfile?.batch ?? "Your batch"} — plan your learning for today.`}
        actions={
          <Button className="rounded-full" onClick={() => go(routes.student.aiStudy)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Open AI tutor
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Flame} title="Learning Streak" value="12 days" detail="Keep it up!" accentClassName="bg-rose-500/10 text-rose-600" />
        <StatTile icon={Target} title="Today's Goal" value={`${todaysGoalCount} / 3`} detail="Topics" accentClassName="bg-primary/10 text-primary" />
        <StatTile icon={Clock3} title="Study Time Today" value="1h 45m" detail="+20m vs yesterday" accentClassName="bg-sky-500/10 text-sky-600" />
        <StatTile icon={LineChart} title="Overall Progress" value={`${overallProgress}%`} detail="+8% this week" accentClassName="bg-amber-500/10 text-amber-600" />

        <Card className="surface-card xl:col-span-4">
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-semibold text-foreground">
              Topic mastery <span className="text-muted-foreground">(this week)</span>
            </p>
            <div className="space-y-4">
              {masteryTopics.map((topic) => (
                <div key={topic.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-slate-700">{topic.name}</span>
                    <span className="font-medium text-slate-900">{topic.percent}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <ProgressBar value={topic.percent} tone={topic.tone} />
                    </div>
                    <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {topic.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-between rounded-full px-3 text-sm text-primary hover:bg-primary/10"
              onClick={() => go(routes.student.learningPath, "Opening learning path")}
            >
              View detailed analysis
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-6 pb-4">
            <div className="space-y-2">
              <SectionHeader title="Personalized Learning Recommendations" />
              <p className="max-w-2xl text-sm text-slate-500">
                AI recommends what you should learn next, based on your performance.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full px-4"
              onClick={() => go(routes.student.aiStudy, "AI recommendations use your course progress")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              How it works
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 p-6 pt-0">
            <div className="space-y-3 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/70 p-3">
              {recommendations.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-4 rounded-[1.25rem] border border-white bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                      <BarIcon title={item.title} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <h4 className="text-base font-semibold text-slate-950">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.category}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:max-w-xl md:grid-cols-[1.3fr_0.9fr]">
                    <div className="space-y-1 border-t border-slate-100 pt-3 md:border-t-0 md:border-l md:pl-4 md:pt-0">
                      <p className="text-sm font-medium text-slate-900">Why?</p>
                      <p className="text-sm leading-6 text-slate-500">{item.reason}</p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end md:justify-center md:border-l md:pl-4">
                      <Button
                        type="button"
                        className="h-10 w-full rounded-full px-5 md:w-auto"
                        onClick={() => go(routes.student.courses, `Starting: ${item.title}`)}
                      >
                        {item.action}
                      </Button>
                      <p className="text-sm text-slate-500">{item.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full px-4 text-primary hover:bg-primary/10"
                onClick={() => go(routes.student.learningPath)}
              >
                View all recommendations
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3 p-6 pb-4">
            <div>
              <CardTitle className="text-xl text-slate-950">Your AI Study Plan</CardTitle>
              <p className="mt-1 text-sm text-slate-500">Personalized next steps for this week.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-full px-3 text-primary hover:bg-primary/10"
              onClick={() => go(routes.student.aiStudy)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Customize
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 p-6 pt-0">
            {studyPlan.map((item, index) => (
              <div
                key={`${item.label}-${item.course}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.tone} text-sm font-semibold`}>
                    {index === 0 ? <BadgeCheck className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <p className="truncate text-sm font-medium text-slate-950">{item.course}</p>
                    <p className="text-sm text-slate-500">{currentCourse}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={index === 0 ? "outline" : "default"}
                  className={index === 0 ? "rounded-full" : "rounded-full"}
                  disabled={index === 0}
                  onClick={() => index > 0 && go(routes.student.courses, `Next: ${item.course}`)}
                >
                  {item.action}
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              className="h-10 w-full rounded-full px-4 text-primary hover:bg-primary/10"
              onClick={() => go(routes.student.learningPath)}
            >
              View full study plan
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <SectionHeader title="Strengths & Weaknesses" action="View full report" onAction={() => go(routes.student.learningPath)} />
          </CardHeader>
          <CardContent className="space-y-5 p-6 pt-0">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full p-3"
                style={{
                  backgroundImage:
                    "conic-gradient(#22c55e 0 40%, #3b82f6 40% 70%, #f59e0b 70% 90%, #ef4444 90% 100%)",
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Overall</p>
                    <p className="text-3xl font-semibold tracking-tight text-slate-950">{overallProgress}%</p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                {[
                  { label: "Strong", value: "40%", tone: "bg-emerald-500" },
                  { label: "Good", value: "30%", tone: "bg-blue-500" },
                  { label: "Weak", value: "20%", tone: "bg-amber-500" },
                  { label: "Needs Focus", value: "10%", tone: "bg-rose-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.tone}`} />
                      <span className="text-slate-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-slate-950">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <SectionHeader title="AI Insights" action="View all insights" onAction={() => go(routes.student.aiStudy)} />
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            {[
              "You learn best in the morning between 8 AM - 11 AM.",
              "You scored higher in practice quizzes on weekends.",
              "Focus more on weak topics to improve overall performance.",
            ].map((insight, index) => (
              <div key={insight} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  {index === 0 ? <Lightbulb className="h-4 w-4" /> : index === 1 ? <Trophy className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </div>
                <p className="text-sm leading-6 text-slate-600">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <CardHeader className="pb-3">
            <SectionHeader title="Upcoming Assessments" action="View all" onAction={() => go(routes.student.assignments)} />
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {[
              { title: "Math Quiz - Algebra", time: "21 May 2026, 10:00 AM", due: "2 Days Left", tone: "bg-indigo-50 text-indigo-700" },
              { title: "Physics Assignment", time: "23 May 2026, 11:59 PM", due: "4 Days Left", tone: "bg-emerald-50 text-emerald-700" },
              { title: "Chemistry Test", time: "25 May 2026, 9:00 AM", due: "6 Days Left", tone: "bg-amber-50 text-amber-700" },
            ].map((assessment) => (
              <div
                key={assessment.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">{assessment.title}</p>
                    <p className="truncate text-sm text-slate-500">{assessment.time}</p>
                  </div>
                </div>
                <Badge className={`${assessment.tone} rounded-full border-0 px-3 py-1 text-xs font-medium`}>
                  {assessment.due}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 text-white shadow-[0_30px_90px_-50px_rgba(79,70,229,0.7)]">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/75">
              <Sparkles className="h-4 w-4" />
              Ask AI Tutor anything
            </p>
            <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
              Turn questions into explanations, quizzes, and study notes in seconds.
            </h3>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            {["Explain chain rule in calculus", "Create a quiz on photosynthesis", "Summarize this topic"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => go(routes.student.aiStudy)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur transition hover:bg-white/20"
              >
                {prompt}
              </button>
            ))}
            <Button
              onClick={() => go(routes.student.aiStudy)}
              className="h-12 w-12 rounded-full bg-white text-indigo-600 hover:bg-indigo-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
