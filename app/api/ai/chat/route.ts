import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndUpdateAiQuota, generateAiResponse } from "@/lib/ai-engine";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, context } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check quota
    const quota = await checkAndUpdateAiQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "Daily AI request limit reached",
          limitReached: true,
          isPro: false,
          remaining: 0,
          limit: quota.limit,
          resetHours: quota.resetHours,
          resetMinutes: quota.resetMinutes,
          message: `You've used your ${quota.limit} free AI requests for today. Limit refreshes in ${quota.resetHours}h ${quota.resetMinutes}m, or upgrade to LifeOS Pro for unlimited access.`,
        },
        { status: 429 }
      );
    }

    // Call AI with user.id so custom API keys and context are loaded
    const reply = await generateAiResponse(prompt.trim(), user.id, context);

    return NextResponse.json({
      success: true,
      reply,
      quota: {
        isPro: quota.isPro,
        remaining: quota.remaining,
        dailyCount: quota.dailyCount,
        limit: quota.limit,
        resetHours: quota.resetHours,
        resetMinutes: quota.resetMinutes,
      },
    });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    return NextResponse.json({ error: "AI Assistant failed to respond" }, { status: 500 });
  }
}
