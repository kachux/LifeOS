import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return NextResponse.json({
      sessions,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch study sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, durationMinutes, notes } = await req.json();
    if (!subject || !durationMinutes) {
      return NextResponse.json({ error: "Subject and duration required" }, { status: 400 });
    }

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        subject,
        durationMinutes: parseInt(durationMinutes, 10),
        notes: notes || "",
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to log study session" }, { status: 500 });
  }
}
