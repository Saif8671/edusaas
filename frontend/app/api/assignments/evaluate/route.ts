import { NextResponse } from "next/server";

export const runtime = "nodejs";

type EvaluateRequestBody = {
  assignmentTitle?: string;
  course?: string;
  batch?: string;
  studentName?: string;
  fileName?: string;
  notes?: string;
  submittedAt?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function gradeFromScore(score: number) {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 88) return "A-";
  if (score >= 82) return "B+";
  if (score >= 76) return "B";
  if (score >= 70) return "B-";
  if (score >= 64) return "C+";
  if (score >= 58) return "C";
  return "D";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EvaluateRequestBody>;
    const assignmentTitle = String(body.assignmentTitle ?? "").trim();
    const course = String(body.course ?? "").trim();
    const studentName = String(body.studentName ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!assignmentTitle || !course || !studentName) {
      return NextResponse.json(
        { error: "assignmentTitle, course, and studentName are required." },
        { status: 400 },
      );
    }

    const keywordBonus =
      /(excellent|clear|well|strong|thorough|correct|accurate|insightful)/i.test(notes) ? 8 : 0;
    const structureBonus = notes.split(/\s+/).filter(Boolean).length > 45 ? 10 : notes.length > 0 ? 5 : 0;
    const fileBonus = body.fileName ? 4 : 0;
    const timelinessBonus = body.submittedAt ? 6 : 0;
    const titleBonus = assignmentTitle.length > 18 ? 3 : 0;
    const baseScore = 70 + keywordBonus + structureBonus + fileBonus + timelinessBonus + titleBonus;
    const score = clamp(baseScore, 55, 100);
    const grade = gradeFromScore(score);

    const strengths = [
      "Clear alignment with the assignment brief",
      "Relevant structure and presentation",
      body.fileName ? `Attached file: ${body.fileName}` : "Submission metadata captured",
    ];

    const improvements = [
      score < 85 ? "Add more concrete examples to strengthen the answer." : "Keep the same clarity while adding one deeper example.",
      notes.length < 140 ? "Expand the explanation with a little more detail." : "Trim repetitive lines and keep the answer concise.",
      "Check formatting and final proofread before resubmitting.",
    ];

    const feedback = `${studentName} demonstrates a good grasp of ${course}. ${strengths[0]} and ${strengths[1].toLowerCase()}. ${improvements[0]}`;

    return NextResponse.json({
      demo: true,
      evaluated: true,
      score,
      grade,
      feedback,
      strengths,
      improvements,
      summary: `${grade} level submission for ${assignmentTitle} in ${course}.`,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to evaluate assignment.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
