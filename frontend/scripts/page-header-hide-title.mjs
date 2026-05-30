import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const skip = [
  "app/(auth)",
  "app/page.tsx",
  "app/student/dashboard",
  "app/admin/dashboard",
  "app/faculty/dashboard",
  "app/parent/dashboard",
  "app/student/ai-study-assistance",
  "app/student/assignments",
  "app/student/attendance",
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name === "page.tsx") acc.push(full);
  }
  return acc;
}

for (const file of walk(path.join(root, "app"))) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (skip.some((prefix) => rel.startsWith(prefix))) continue;
  let src = readFileSync(file, "utf8");
  if (!src.includes("<PageHeader") || src.includes("hideTitle")) continue;
  src = src.replace(/<PageHeader\s+/, '<PageHeader hideTitle ');
  writeFileSync(file, src);
  console.log("hideTitle:", rel);
}
