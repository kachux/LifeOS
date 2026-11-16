import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: "FREE",
        subscriptionEnd: null,
      },
    });

    return NextResponse.json({ success: true, message: "Subscription cancelled" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
