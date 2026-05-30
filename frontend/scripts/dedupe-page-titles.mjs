import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

/** @type {Array<{ file: string; title: string; description: string }>} */
const pages = [
  {
    file: "app/admin/students/page.tsx",
    title: "Student Manager",
    description: "Create, edit, and delete student records with parent mapping and attendance.",
  },
  {
    file: "app/admin/courses/page.tsx",
    title: "Course Inventory",
    description: "Manage catalog entries, publish state, and enrollment caps.",
  },
  {
    file: "app/admin/faculty/page.tsx",
    title: "Faculty Directory",
    description: "Onboard instructors and assign them to batches and courses.",
  },
  {
    file: "app/admin/batches/page.tsx",
    title: "Batches & Scheduling",
    description: "Organize cohorts, timetables, and faculty assignments.",
  },
  {
    file: "app/admin/marketplace/page.tsx",
    title: "Course Marketplace",
    description: "Publish paid courses and monitor storefront performance.",
  },
  {
    file: "app/admin/announcements/page.tsx",
    title: "Institute Messaging",
    description: "Broadcast announcements to students, parents, and faculty.",
  },
  {
    file: "app/faculty/students/page.tsx",
    title: "Student Roster",
    description: "Review learners across your assigned batches.",
  },
  {
    file: "app/faculty/live/page.tsx",
    title: "Live Session Broadcasts",
    description: "Schedule and launch live classes for your batches.",
  },
  {
    file: "app/student/live/page.tsx",
    title: "Live Classes",
    description: "Join scheduled sessions and review upcoming meetings.",
  },
  {
    file: "app/parent/messages/page.tsx",
    title: "Parent Messages",
    description: "Read school updates and communicate with faculty.",
  },
];

const h2Re = /<h2 className="text-3xl font-bold tracking-tight">[^<]+<\/h2>\s*\n\s*<p className="text-muted-foreground">[^<]+<\/p>/;

for (const { file, title, description } of pages) {
  const full = path.join(root, file);
  let src = readFileSync(full, "utf8");
  if (!src.includes("PageHeader")) {
    src = src.replace(
      /^(import .+\n)+/m,
      (block) => `${block}import { PageHeader } from "@/components/app/page-header";\n`,
    );
  }
  if (!src.includes("page-shell")) {
    src = src.replace(/<div className="space-y-6">/, '<div className="page-shell space-y-6">');
    src = src.replace(/return \(\s*\n\s*<div className="space-y-/, 'return (\n    <div className="page-shell space-y-');
  }
  const header = `<PageHeader hideTitle title="${title}" description="${description}" />`;
  if (src.includes(header)) {
    console.log("skip (done):", file);
    continue;
  }
  if (!h2Re.test(src)) {
    console.log("skip (no h2):", file);
    continue;
  }
  src = src.replace(h2Re, "").replace(
    /<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">\s*<div>\s*<\/div>/,
    `<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">\n      ${header}\n      <div className="hidden">`,
  );
  // Simpler: replace whole header block when pattern is flex with h2 inside
  src = readFileSync(full, "utf8");
  const blockRe = new RegExp(
    `<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">\\s*<div>\\s*<h2 className="text-3xl font-bold tracking-tight">${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/h2>\\s*<p className="text-muted-foreground">${description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/p>\\s*<\\/div>`,
  );
  if (!blockRe.test(src)) {
    console.log("skip (block mismatch):", file);
    continue;
  }
  if (!src.includes("PageHeader")) {
    src = src.replace(
      /^(import .+\n)+/m,
      (block) => `${block}import { PageHeader } from "@/components/app/page-header";\n`,
    );
  }
  src = src.replace(blockRe, header);
  if (!src.includes("page-shell")) {
    src = src.replace(/return \(\s*\n\s*<div className="space-y-6">/, "return (\n    <div className=\"page-shell space-y-6\">");
  }
  writeFileSync(full, src);
  console.log("fixed:", file);
}
