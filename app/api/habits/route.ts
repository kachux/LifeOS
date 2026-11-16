import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      include: {
        logs: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const today = new Date().toISOString().split("T")[0];

    const habitsWithToday = habits.map((h) => {
      const isCompletedToday = h.logs.some((l) => l.date === today && l.completed);
      return {
        ...h,
        isCompletedToday,
      };
    });

    const completedTodayCount = habitsWithToday.filter((h) => h.isCompletedToday).length;
    const totalHabitsCount = habitsWithToday.length;
    const todayRate = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

    return NextResponse.json({
      habits: habitsWithToday,
      today,
      completedTodayCount,
      totalHabitsCount,
      todayRate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, category, color, icon } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name,
        category: category || "Daily",
        color: color || "blue",
        icon: icon || "Check",
      },
      include: { logs: true },
    });

    return NextResponse.json({ success: true, habit: { ...habit, isCompletedToday: false } });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.habit.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
