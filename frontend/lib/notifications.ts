export type AttendanceAlertInput = {
  studentName: string;
  attendancePct: number;
  course?: string;
  batch?: string;
  recipientName?: string;
  note?: string;
};

export type StudentContact = {
  name: string;
  email?: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
};

export type FeeReminderInput = {
  childName: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
};

export type AssignmentDeadlineInput = {
  title: string;
  course: string;
  deadline: string;
};

export type CertificateIssuedInput = {
  studentName: string;
  course: string;
  batch: string;
  certificateId: string;
  issuer: string;
};

type DeliverNotificationInput = {
  toEmail?: string | string[];
  toPhone?: string;
  subject: string;
  html: string;
  text: string;
  whatsappBody?: string;
};

type ApiResponse = {
  demo?: boolean;
  provider?: string;
  message?: string;
};

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

function normalizeWhatsAppRecipient(phone: string) {
  const trimmed = phone.replace(/\s+/g, "");
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

export async function deliverNotification(input: DeliverNotificationInput) {
  const tasks: Promise<unknown>[] = [];

  if (input.toEmail) {
    tasks.push(
      postJson<ApiResponse>("/api/notifications/email", {
        to: input.toEmail,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    );
  }

  if (input.toPhone) {
    tasks.push(
      postJson<ApiResponse>("/api/notifications/whatsapp", {
        to: normalizeWhatsAppRecipient(input.toPhone),
        body: input.whatsappBody ?? input.text,
      }),
    );
  }

  if (tasks.length === 0) {
    throw new Error("At least one delivery target is required.");
  }

  await Promise.all(tasks);
}

export function buildAttendanceAlertText(input: AttendanceAlertInput) {
  const lines = [
    "EduLMS Alert",
    "",
    `Student: ${input.studentName}`,
    input.batch ? `Batch: ${input.batch}` : null,
    input.course ? `Course: ${input.course}` : null,
    `Attendance has dropped to ${input.attendancePct}%.`,
    input.note ? input.note : "Please contact the faculty team for support.",
    "",
    "Regards,",
    "EduLMS",
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildAttendanceAlertHtml(input: AttendanceAlertInput) {
  const note = input.note ?? "Please contact the faculty team for support.";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">EduLMS Alert</h2>
      <p style="margin: 0 0 8px;"><strong>Student:</strong> ${input.studentName}</p>
      ${input.batch ? `<p style="margin: 0 0 8px;"><strong>Batch:</strong> ${input.batch}</p>` : ""}
      ${input.course ? `<p style="margin: 0 0 8px;"><strong>Course:</strong> ${input.course}</p>` : ""}
      <p style="margin: 0 0 8px;">Attendance has dropped to <strong>${input.attendancePct}%</strong>.</p>
      <p style="margin: 0 0 16px;">${note}</p>
      <p style="margin: 0;">Regards,<br />EduLMS</p>
    </div>
  `;
}

export function buildFeeReminderText(input: FeeReminderInput) {
  return [
    "EduLMS Fee Reminder",
    "",
    `Student: ${input.childName}`,
    `Invoice: ${input.invoiceId}`,
    `Amount Due: INR ${input.amount}`,
    `Due Date: ${input.dueDate}`,
    "",
    "Please complete the payment at the earliest.",
    "",
    "Regards,",
    "EduLMS",
  ].join("\n");
}

export function buildFeeReminderHtml(input: FeeReminderInput) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">EduLMS Fee Reminder</h2>
      <p style="margin: 0 0 8px;"><strong>Student:</strong> ${input.childName}</p>
      <p style="margin: 0 0 8px;"><strong>Invoice:</strong> ${input.invoiceId}</p>
      <p style="margin: 0 0 8px;"><strong>Amount Due:</strong> INR ${input.amount}</p>
      <p style="margin: 0 0 8px;"><strong>Due Date:</strong> ${input.dueDate}</p>
      <p style="margin: 0 0 16px;">Please complete the payment at the earliest.</p>
      <p style="margin: 0;">Regards,<br />EduLMS</p>
    </div>
  `;
}

export function buildAssignmentDeadlineText(input: AssignmentDeadlineInput) {
  return [
    "EduLMS Assignment Reminder",
    "",
    `Assignment: ${input.title}`,
    `Course: ${input.course}`,
    `Deadline: ${input.deadline}`,
    "",
    "Please submit before the deadline to avoid late penalties.",
    "",
    "Regards,",
    "EduLMS",
  ].join("\n");
}

export function buildAssignmentDeadlineHtml(input: AssignmentDeadlineInput) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">EduLMS Assignment Reminder</h2>
      <p style="margin: 0 0 8px;"><strong>Assignment:</strong> ${input.title}</p>
      <p style="margin: 0 0 8px;"><strong>Course:</strong> ${input.course}</p>
      <p style="margin: 0 0 8px;"><strong>Deadline:</strong> ${input.deadline}</p>
      <p style="margin: 0 0 16px;">Please submit before the deadline to avoid late penalties.</p>
      <p style="margin: 0;">Regards,<br />EduLMS</p>
    </div>
  `;
}

export function buildCertificateIssuedText(input: CertificateIssuedInput) {
  return [
    "EduLMS Certificate Issued",
    "",
    `Student: ${input.studentName}`,
    `Course: ${input.course}`,
    `Batch: ${input.batch}`,
    `Certificate ID: ${input.certificateId}`,
    `Issued by: ${input.issuer}`,
    "",
    "Your completion certificate is now available for download.",
    "",
    "Regards,",
    "EduLMS",
  ].join("\n");
}

export function buildCertificateIssuedHtml(input: CertificateIssuedInput) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">EduLMS Certificate Issued</h2>
      <p style="margin: 0 0 8px;"><strong>Student:</strong> ${input.studentName}</p>
      <p style="margin: 0 0 8px;"><strong>Course:</strong> ${input.course}</p>
      <p style="margin: 0 0 8px;"><strong>Batch:</strong> ${input.batch}</p>
      <p style="margin: 0 0 8px;"><strong>Certificate ID:</strong> ${input.certificateId}</p>
      <p style="margin: 0 0 8px;"><strong>Issued by:</strong> ${input.issuer}</p>
      <p style="margin: 0 0 16px;">Your completion certificate is now available for download.</p>
      <p style="margin: 0;">Regards,<br />EduLMS</p>
    </div>
  `;
}
