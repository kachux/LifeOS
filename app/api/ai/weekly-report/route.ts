import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndUpdateAiQuota, generateWeeklyLifeReport } from "@/lib/ai-engine";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reports = await prisma.aiReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const quota = await checkAndUpdateAiQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Daily AI quota reached",
          limitReached: true,
          resetHours: quota.resetHours,
          resetMinutes: quota.resetMinutes,
        },
        { status: 429 }
      );
    }

    const report = await generateWeeklyLifeReport(user.id);

    return NextResponse.json({
      success: true,
      report,
      quota,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to generate weekly report" }, { status: 500 });
  }
}
