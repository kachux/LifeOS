import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndUpdateAiQuota, generatePersonalizedImprovementPlan } from "@/lib/ai-engine";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await prisma.aiPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500 });
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

    const { plan, actionSteps } = await generatePersonalizedImprovementPlan(user.id);

    return NextResponse.json({
      success: true,
      plan,
      actionSteps,
      quota,
    });
  } catch (err: any) {
    console.error("AI Analysis error:", err);
    return NextResponse.json({ error: "Failed to generate improvement plan" }, { status: 500 });
  }
}
