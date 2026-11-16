import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const timeline = await prisma.timelineEvent.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ timeline });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, category, date, icon } = await req.json();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const event = await prisma.timelineEvent.create({
      data: {
        userId: user.id,
        title,
        description: description || "",
        category: category || "Achievement",
        icon: icon || "Award",
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to log timeline milestone" }, { status: 500 });
  }
}
