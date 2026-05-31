"use client";

import { useMemo, type ComponentType, type ReactNode } from "react";
import { ArrowRight, ClipboardList, GraduationCap, Users2 } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { attendanceStatusMeta } from "../constants";
import type { AttendanceMode, AttendanceStatus, BatchCard, SummaryMetric } from "../types";
import { getCalendarCells } from "../utils";

export function Sparkline({ data, stroke }: { data: Array<{ value: number }>; stroke: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SummaryCard({ label, value, detail, icon: Icon, tone, progress, progressClass }: SummaryMetric) {
  return (
    <Card className="attendance-panel">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tone)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{detail}</p>
          </div>
        </div>
        {typeof progress === "number" ? (
          <div className="mt-3 space-y-1.5">
            <Progress value={progress} className="h-1.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Today</span>
              <span className={cn("font-medium", progressClass)}>{progress}%</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ModeTabs({ mode }: { mode: AttendanceMode }) {
  return (
    <div className="flex w-full flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:w-auto">
      <button
        type="button"
        className={cn(
          "inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition sm:flex-none sm:py-0",
          mode === "admin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
        )}
      >
        <Users2 className="h-4 w-4" />
        Student Attendance
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition sm:flex-none sm:py-0",
          mode === "faculty" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted",
        )}
      >
        <GraduationCap className="h-4 w-4" />
        Faculty Attendance
      </button>
    </div>
  );
}

export function BatchMiniCard({ batch }: { batch: BatchCard }) {
  return (
    <div className={cn("rounded-xl border p-3 sm:p-4", batch.tone)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", batch.iconTone)}>
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{batch.name}</p>
            <p className="text-xs text-muted-foreground">{batch.students} students</p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", batch.iconTone)}>{batch.attendance}%</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="grid flex-1 grid-cols-3 gap-1.5 text-center text-[11px] sm:text-xs">
          <div className="rounded-lg bg-background/80 px-1 py-1.5 font-medium text-emerald-600 dark:bg-background/20 dark:text-emerald-400">{batch.present} in</div>
          <div className="rounded-lg bg-background/80 px-1 py-1.5 font-medium text-rose-600 dark:bg-background/20 dark:text-rose-400">{batch.absent} out</div>
          <div className="rounded-lg bg-background/80 px-1 py-1.5 font-medium text-amber-600 dark:bg-background/20 dark:text-amber-400">{batch.late} late</div>
        </div>
        <div className="h-10 w-16 shrink-0 sm:w-20">
          <Sparkline data={batch.trend.map((value) => ({ value }))} stroke={batch.line} />
        </div>
      </div>
    </div>
  );
}

export function AttendanceChoice({
  status,
  active,
  onSelect,
}: {
  status: AttendanceStatus;
  active?: boolean;
  onSelect?: () => void;
}) {
  const meta = attendanceStatusMeta[status];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 min-h-8 min-w-8 flex-none items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        active ? meta.dotClass : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
      )}
      aria-pressed={active}
      aria-label={`Mark as ${meta.label}`}
      onClick={onSelect}
    >
      <Icon className={cn("h-3.5 w-3.5", active ? meta.iconClass : "opacity-40")} />
    </button>
  );
}

export function CalendarGrid({ date }: { date: Date }) {
  const cells = useMemo(() => getCalendarCells(date), [date]);

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {cells.map((cell, index) => {
        if (!cell.day) {
          return <div key={`empty-${index}`} className="aspect-square max-h-9 rounded-full" />;
        }

        const meta = cell.status ? attendanceStatusMeta[cell.status] : null;
        const isToday = cell.isToday;

        return (
          <div
            key={cell.day}
            className={cn(
              "flex aspect-square max-h-9 items-center justify-center rounded-full border text-xs font-medium sm:text-sm",
              isToday ? "border-primary bg-primary text-primary-foreground" : "border-transparent text-foreground",
            )}
          >
            {meta ? (
              <meta.icon className={cn("h-4 w-4", isToday ? "text-primary-foreground" : meta.iconClass)} />
            ) : (
              <span>{cell.day}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AttendanceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
      {(["present", "absent", "late", "holiday"] as AttendanceStatus[]).map((status) => {
        const meta = attendanceStatusMeta[status];
        const Icon = meta.icon;

        return (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                status === "present"
                  ? "bg-emerald-500/15"
                  : status === "absent"
                    ? "bg-rose-500/15"
                    : status === "late"
                      ? "bg-amber-500/15"
                      : "bg-muted",
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", meta.iconClass)} />
            </span>
            <span>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <CardTitle className="min-w-0 text-base font-semibold sm:text-lg">{title}</CardTitle>
      {actionLabel ? (
        <Button variant="ghost" size="sm" className="h-8 shrink-0 self-start px-2 text-primary sm:self-auto" onClick={onAction}>
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function AttendanceTableShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <div className="border-t border-border">
        <div className="min-w-0 max-h-[min(420px,50vh)] overflow-auto scrollbar-thin">{children}</div>
      </div>
      {footer ? <div className="border-t border-border p-4 sm:px-5">{footer}</div> : null}
    </>
  );
}

export function RiskStudentRow({
  name,
  rollNo,
  pct,
  sending,
  onNotify,
}: {
  name: string;
  rollNo: string;
  pct: number;
  sending: boolean;
  onNotify: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          <span className="text-xs text-muted-foreground">{rollNo}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className={cn("w-10 text-right text-xs font-semibold", pct < 70 ? "text-rose-500" : "text-amber-600")}>
            {pct}%
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 rounded-lg" onClick={onNotify} disabled={sending}>
        {sending ? "Sending…" : "Notify parent"}
      </Button>
    </div>
  );
}

export function QuickActionTile({
  label,
  helper,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 min-w-0 flex-col rounded-xl border border-border/60 bg-muted/30 p-3 text-left transition hover:border-primary/30 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-2 text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{helper}</p>
    </button>
  );
}
