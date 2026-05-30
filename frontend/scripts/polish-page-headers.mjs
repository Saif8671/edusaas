import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const skip = new Set([
  "app/page.tsx",
  "app/student/dashboard/page.tsx",
  "app/student/ai-study-assistance/page.tsx",
  "app/student/assignments/page.tsx",
  "app/(auth)/login/page.tsx",
]);

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
  if (skip.has(rel)) continue;

  let src = readFileSync(file, "utf8");
  if (src.includes("PageHeader")) continue;

  const headerMatch = src.match(
    /<div className="space-y-6">\s*<div>\s*<h2 className="text-3xl font-bold tracking-tight">([^<]+)<\/h2>\s*<p className="text-muted-foreground">([^<]+)<\/p>\s*<\/div>/s,
  );

  if (!headerMatch) continue;

  const [, title, description] = headerMatch;

  if (!src.includes('from "@/components/app/page-header"')) {
    const insertAt = src.startsWith('"use client"') ? src.indexOf("\n") + 1 : 0;
    src =
      src.slice(0, insertAt) +
      'import { PageHeader } from "@/components/app/page-header";\n' +
      src.slice(insertAt);
  }

  src = src.replace(
    /<div className="space-y-6">\s*<div>\s*<h2 className="text-3xl font-bold tracking-tight">[^<]+<\/h2>\s*<p className="text-muted-foreground">[^<]+<\/p>\s*<\/div>/s,
    `<div className="page-shell">\n      <PageHeader title="${title.trim()}" description="${description.trim()}" />`,
  );

  writeFileSync(file, src);
  console.log("Updated", rel);
}
