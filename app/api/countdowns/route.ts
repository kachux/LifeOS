import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.specialDay.findMany({
      where: { userId: user.id },
      orderBy: { targetDate: "asc" },
    });

    const now = Date.now();

    const formatted = items.map((item) => {
      const targetTime = new Date(item.targetDate).getTime();
      const diffMs = targetTime - now;
      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const isToday =
        new Date(item.targetDate).toDateString() === new Date().toDateString();
      const isPast = diffMs < 0 && !isToday;

      let countdownText = "";
      if (isToday) {
        countdownText = "Today! 🎉";
      } else if (daysLeft === 1) {
        countdownText = "Tomorrow (1 day left)";
      } else if (daysLeft > 1) {
        countdownText = `${daysLeft} days left`;
      } else {
        countdownText = `Passed ${Math.abs(daysLeft)} days ago`;
      }

      return {
        ...item,
        daysLeft,
        hoursLeft: totalHours,
        minutesLeft: totalMinutes,
        isToday,
        isPast,
        countdownText,
      };
    });

    // Sort: upcoming events first (closest to today), then past events
    formatted.sort((a, b) => {
      if (!a.isPast && b.isPast) return -1;
      if (a.isPast && !b.isPast) return 1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });

    const nextEvent = formatted.find((e) => !e.isPast) || null;

    return NextResponse.json({
      events: formatted,
      nextEvent,
      totalCount: formatted.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load special days" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, targetDate, category, color, notes } = body;

    if (!title || !targetDate) {
      return NextResponse.json({ error: "Title and target date are required" }, { status: 400 });
    }

    const created = await prisma.specialDay.create({
      data: {
        userId: user.id,
        title,
        targetDate: new Date(targetDate),
        category: category || "Event",
        color: color || "blue",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, event: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create special day" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    await prisma.specialDay.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete special day" }, { status: 500 });
  }
}
