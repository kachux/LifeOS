import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tier } = await req.json();
    const nextTier = tier === "PRO" ? "PRO" : "FREE";

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: nextTier,
        // If resetting back to free, reset count to test limits
        dailyAiCount: nextTier === "FREE" ? 10 : 0,
      },
    });

    return NextResponse.json({ success: true, tier: updated.tier, dailyAiCount: updated.dailyAiCount });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to switch tier" }, { status: 500 });
  }
}
