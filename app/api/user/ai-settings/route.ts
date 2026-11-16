import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { apiKey, aiProvider } = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        userApiKey: apiKey ? apiKey.trim() : null,
        aiProvider: aiProvider || "gemini",
      },
      select: {
        id: true,
        username: true,
        userApiKey: true,
        aiProvider: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
  }
}
