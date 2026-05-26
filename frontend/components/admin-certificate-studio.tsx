"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { StudentData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Upload, Share2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminCertificateStudioProps = {
  student: StudentData | null;
};

type CanvasMode = "classic" | "emerald" | "midnight";

const THEMES: Array<{
  id: CanvasMode;
  label: string;
  accent: string;
}> = [
  { id: "classic", label: "Classic", accent: "#b9892f" },
  { id: "emerald", label: "Emerald", accent: "#2d6a4f" },
  { id: "midnight", label: "Midnight", accent: "#1d3557" },
];

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, family: string) {
  let size = startSize;
  while (size > 28) {
    ctx.font = `700 ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return size;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

async function renderCertificateCanvas(
  canvas: HTMLCanvasElement,
  student: StudentData,
  theme: CanvasMode,
  backgroundUrl: string | null,
  issuer: string,
) {
  const width = 1600;
  const height = 1100;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const palette = {
    classic: { bg1: "#fffaf2", bg2: "#fff2dd", accent: "#b9892f", ink: "#2f2a24" },
    emerald: { bg1: "#f3fbf7", bg2: "#e4f3ea", accent: "#2d6a4f", ink: "#15231c" },
    midnight: { bg1: "#f3f7fb", bg2: "#dce7f5", accent: "#1d3557", ink: "#122033" },
  }[theme];

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, palette.bg1);
  grad.addColorStop(1, palette.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  if (backgroundUrl) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = backgroundUrl;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.drawImage(image, 0, 0, width, height);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  drawRoundedRect(ctx, 70, 70, width - 140, height - 140, 42);
  ctx.fill();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, 70, 70, width - 140, height - 140, 42);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 100, 100, width - 200, height - 200, 30);
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(175, 175, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 34px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("E", 175, 176);

  ctx.fillStyle = palette.ink;
  ctx.font = "600 26px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("EduLMS Academic Institute", 250, 160);

  ctx.fillStyle = palette.accent;
  ctx.font = "700 18px Inter, system-ui, sans-serif";
  ctx.fillText("OFFICIAL CERTIFICATE OF COMPLETION", 250, 198);

  ctx.fillStyle = palette.ink;
  ctx.textAlign = "center";
  ctx.font = "700 42px Inter, system-ui, sans-serif";
  ctx.fillText("This Certificate Is Proudly Presented To", width / 2, 330);

  ctx.fillStyle = palette.accent;
  const nameSize = fitFont(ctx, student.name, width - 320, 96, "Georgia, serif");
  ctx.font = `700 ${nameSize}px Georgia, serif`;
  ctx.fillText(student.name, width / 2, 470);

  ctx.fillStyle = palette.ink;
  ctx.font = "500 34px Inter, system-ui, sans-serif";
  ctx.fillText("For successfully completing the learning journey", width / 2, 545);

  ctx.font = "700 52px Inter, system-ui, sans-serif";
  ctx.fillStyle = palette.accent;
  ctx.fillText(student.course, width / 2, 640);

  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(360, 715);
  ctx.lineTo(width - 360, 715);
  ctx.stroke();

  ctx.fillStyle = palette.ink;
  ctx.font = "600 28px Inter, system-ui, sans-serif";
  ctx.fillText(`Batch ${student.batch}`, width / 2, 770);

  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillText(`Issued on ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, width / 2, 820);

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(1240, 820, 76, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.fillText("VERIFIED", 1240, 806);
  ctx.font = "500 17px Inter, system-ui, sans-serif";
  ctx.fillText("Credential", 1240, 833);

  ctx.fillStyle = palette.ink;
  ctx.font = "600 24px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Certificate ID: CERT-${student.id}`, 150, 940);
  ctx.fillText(`Issued by: ${issuer}`, 150, 975);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(150, 1005, 240, 2);
  ctx.fillStyle = palette.ink;
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.fillText("Authorized signature", 150, 1040);

  ctx.textAlign = "right";
  ctx.fillText("Principal Office", width - 150, 1040);
}

export function AdminCertificateStudio({ student }: AdminCertificateStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [theme, setTheme] = useState<CanvasMode>("emerald");
  const [issuer, setIssuer] = useState("Academic Admin");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [lastIssuedAt, setLastIssuedAt] = useState<string | null>(null);

  const selectedStudent = student;

  const downloadName = useMemo(() => {
    if (!selectedStudent) return "certificate.png";
    return `Certificate_${selectedStudent.name.replace(/[^a-z0-9]/gi, "_")}.png`;
  }, [selectedStudent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedStudent) return;

    setIsRendering(true);
    renderCertificateCanvas(canvas, selectedStudent, theme, backgroundUrl, issuer)
      .finally(() => setIsRendering(false));
  }, [selectedStudent, theme, backgroundUrl, issuer]);

  const handleBackgroundUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const nextUrl = URL.createObjectURL(file);
    setBackgroundUrl(nextUrl);
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedStudent) return;

    await renderCertificateCanvas(canvas, selectedStudent, theme, backgroundUrl, issuer);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = downloadName;
      link.click();
      URL.revokeObjectURL(objectUrl);
      setLastIssuedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }, "image/png");
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedStudent || !navigator.share) return;

    await renderCertificateCanvas(canvas, selectedStudent, theme, backgroundUrl, issuer);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], downloadName, { type: "image/png" });
      await navigator.share({
        title: `Certificate for ${selectedStudent.name}`,
        text: `Completion certificate for ${selectedStudent.name}`,
        files: [file],
      });
      setLastIssuedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    }, "image/png");
  };

  return (
    <Card className="glass-card overflow-hidden rounded-[1.8rem] border-border/60 bg-background/80">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-500/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Certificate Studio
            </CardTitle>
            <CardDescription>
              Choose a learner, shape the certificate, and issue a downloadable proof of completion.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/5 text-emerald-700">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Live generator
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        {selectedStudent ? (
          <>
            <div className="grid gap-4 md:grid-cols-[1fr_260px]">
              <div className="space-y-3 rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected learner</p>
                    <h3 className="text-2xl font-semibold tracking-tight">{selectedStudent.name}</h3>
                  </div>
                  <Badge className={cn("rounded-full", selectedStudent.progress >= 80 ? "bg-emerald-600" : "bg-amber-500")}>
                    {selectedStudent.progress >= 80 ? "Eligible" : "Pending"}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Course</p>
                    <p className="mt-2 text-sm font-medium">{selectedStudent.course}</p>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Batch</p>
                    <p className="mt-2 text-sm font-medium">{selectedStudent.batch}</p>
                  </div>
                  <div className="rounded-2xl border bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Issuer</p>
                    <Input
                      value={issuer}
                      onChange={(event) => setIssuer(event.target.value)}
                      className="mt-2 h-9 rounded-xl"
                      placeholder="Academic Admin"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {THEMES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-all",
                        theme === item.id
                          ? "border-transparent text-white shadow-md"
                          : "border-border bg-background/70 text-muted-foreground hover:text-foreground",
                      )}
                      style={theme === item.id ? { backgroundColor: item.accent } : undefined}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-sm font-medium">Issue actions</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate the certificate now or upload a custom background before exporting.
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full justify-start rounded-2xl"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload background
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="w-full justify-start rounded-2xl"
                    disabled={isRendering}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isRendering ? "Rendering..." : "Download PNG"}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    className="w-full justify-start rounded-2xl"
                    disabled={!navigator.share || isRendering}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share certificate
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBackgroundUpload}
                />
                <div className="mt-4 rounded-2xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Issuer note</p>
                  <p className="mt-1">
                    The certificate is generated from the live student record and can be downloaded immediately after render.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Certificate preview</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStudent.name} · {selectedStudent.course}
                  </p>
                </div>
                {lastIssuedAt && (
                  <p className="text-xs text-emerald-600">
                    Last issued at {lastIssuedAt}
                  </p>
                )}
              </div>
              <canvas ref={canvasRef} className="w-full rounded-[1.2rem] border" />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                <p className="mt-2 text-2xl font-semibold">{selectedStudent.progress}%</p>
                <p className="mt-1 text-sm text-muted-foreground">Completion threshold is 80%.</p>
              </div>
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Attendance</p>
                <p className="mt-2 text-2xl font-semibold">{selectedStudent.attendancePct}%</p>
                <p className="mt-1 text-sm text-muted-foreground">Used for graduation eligibility checks.</p>
              </div>
              <div className="rounded-3xl border bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Certificate ID</p>
                <p className="mt-2 break-all text-lg font-semibold">CERT-{selectedStudent.id}</p>
                <p className="mt-1 text-sm text-muted-foreground">Reusable for audit and verification.</p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-8 text-center">
            <p className="text-lg font-semibold">No eligible student selected</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a learner with 80% progress or above from the certificate list to begin issuing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
