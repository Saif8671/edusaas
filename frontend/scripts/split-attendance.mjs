import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcPath = path.join(root, "components/attendance-dashboard.tsx");
const lines = readFileSync(srcPath, "utf8").split(/\r?\n/);
const outDir = path.join(root, "features/attendance");
mkdirSync(outDir, { recursive: true });
mkdirSync(path.join(outDir, "components"), { recursive: true });

const slice = (start, end) => lines.slice(start - 1, end).join("\n");

writeFileSync(
  path.join(outDir, "types.ts"),
  `import type { LucideIcon } from "lucide-react";\n\n${slice(47, 111)}\n\n${slice(253, 264)}`,
);

writeFileSync(path.join(outDir, "constants.ts"), `${slice(113, 287)}`);

writeFileSync(
  path.join(outDir, "utils.ts"),
  `"use client";\n\nimport { buildAttendanceAlertHtml, buildAttendanceAlertText } from "@/lib/notifications";\nimport type { AlertTarget } from "./types";\n\n${slice(289, 603)}`,
);

writeFileSync(
  path.join(outDir, "components", "attendance-ui.tsx"),
  `"use client";\n\nimport { useMemo } from "react";\nimport { ArrowRight, ClipboardList, GraduationCap, Users2 } from "lucide-react";\nimport { Line, LineChart, ResponsiveContainer } from "recharts";\nimport { Button } from "@/components/ui/button";\nimport { Card, CardContent, CardTitle } from "@/components/ui/card";\nimport { Progress } from "@/components/ui/progress";\nimport { cn } from "@/lib/utils";\nimport { attendanceStatusMeta } from "../constants";\nimport type { AttendanceMode, AttendanceStatus, BatchCard, SummaryMetric } from "../types";\nimport { getCalendarCells } from "../utils";\n\n${slice(331, 523)}\n\n${slice(525, 545)}`,
);

const adminImports = `"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleX,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  GraduationCap,
  Info,
  MessageSquare,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  Users2,
  FileDown,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { adminBatchCards, attendanceOverview, facultyAttendanceRows, facultyTrend, leaveRequests, monthlyTrend, riskStudents, studentAttendanceRows } from "./constants";
import { AttendanceChoice, AttendanceLegend, BatchMiniCard, CalendarGrid, ModeTabs, SectionHeader, SummaryCard } from "./components/attendance-ui";
import type { AttendanceDashboardProps, AttendanceStatus } from "./types";
import { formatMonthLabel, formatShortDate, sendAttendanceAlert } from "./utils";
`;

writeFileSync(
  path.join(outDir, "admin-attendance-view.tsx"),
  `${adminImports}\n\n${slice(605, 1058).replace(/^function AdminAttendanceView/, "export function AdminAttendanceView")}`,
);

const facultyImports = adminImports.replace("adminBatchCards", "facultyBatchCards");

writeFileSync(
  path.join(outDir, "faculty-attendance-view.tsx"),
  `${facultyImports}\n\n${slice(1059, 1422).replace(/^function FacultyAttendanceView/, "export function FacultyAttendanceView")}`,
);

writeFileSync(
  path.join(outDir, "index.tsx"),
  `export { AttendanceDashboard } from "./attendance-dashboard";
export type { AttendanceDashboardProps } from "./types";
`,
);

writeFileSync(
  path.join(outDir, "attendance-dashboard.tsx"),
  `import type { AttendanceDashboardProps } from "./types";
import { AdminAttendanceView } from "./admin-attendance-view";
import { FacultyAttendanceView } from "./faculty-attendance-view";

export function AttendanceDashboard(props: AttendanceDashboardProps) {
  if (props.mode === "faculty") {
    return <FacultyAttendanceView {...props} />;
  }
  return <AdminAttendanceView {...props} />;
}
`,
);

writeFileSync(
  path.join(root, "components/attendance-dashboard.tsx"),
  `export { AttendanceDashboard } from "@/features/attendance";
export type { AttendanceDashboardProps } from "@/features/attendance/types";
`,
);

console.log("Split attendance into features/attendance");
