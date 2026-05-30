import { buildAttendanceAlertHtml, buildAttendanceAlertText } from "@/lib/notifications";
import type { AlertTarget, AttendanceStatus, CalendarCell } from "./types";

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getCalendarCells(date: Date): CalendarCell[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const todayKey = date.toDateString();

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { day: null, isToday: false, status: null };
    }

    const dayDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);
    const status: AttendanceStatus =
      dayNumber % 7 === 0 ? "holiday" : dayNumber % 6 === 0 ? "absent" : dayNumber % 5 === 0 ? "late" : "present";

    return {
      day: dayNumber,
      isToday: dayDate.toDateString() === todayKey,
      status,
    };
  });
}

function normalizeWhatsAppRecipient(phone: string) {
  const trimmed = phone.replace(/\s+/g, "");
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request to ${url} failed.`);
  }

  return (await response.json()) as T;
}

export async function sendAttendanceAlert(target: AlertTarget) {
  const alertText = buildAttendanceAlertText({
    studentName: target.name,
    attendancePct: target.attendancePct,
    course: target.course,
    batch: target.batch,
    recipientName: target.parentName,
    note: "Attendance is below the 75% threshold. Please contact the faculty team for support.",
  });

  const alertHtml = buildAttendanceAlertHtml({
    studentName: target.name,
    attendancePct: target.attendancePct,
    course: target.course,
    batch: target.batch,
    recipientName: target.parentName,
    note: "Attendance is below the 75% threshold. Please contact the faculty team for support.",
  });

  const emailRecipient = target.parentEmail || target.fallbackEmail;
  const phoneRecipient = target.parentPhone || target.fallbackPhone;

  await Promise.all([
    postJson("/api/notifications/email", {
      to: emailRecipient,
      subject: `Attendance alert for ${target.name}`,
      html: alertHtml,
      text: alertText,
    }),
    postJson("/api/notifications/whatsapp", {
      to: normalizeWhatsAppRecipient(phoneRecipient),
      body: alertText,
    }),
  ]);
}
