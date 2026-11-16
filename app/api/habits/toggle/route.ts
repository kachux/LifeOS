import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { habitId, date } = await req.json();
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Check existing log
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: targetDate,
        },
      },
    });

    let completed = true;
    if (existingLog) {
      // Toggle off / remove
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      completed = false;
      // Decrement streak
      await prisma.habit.update({
        where: { id: habitId },
        data: { streak: { decrement: 1 } },
      });
    } else {
      // Create completed log
      await prisma.habitLog.create({
        data: {
          habitId,
          userId: user.id,
          date: targetDate,
          completed: true,
        },
      });
      // Increment streak
      await prisma.habit.update({
        where: { id: habitId },
        data: {
          streak: { increment: 1 },
        },
      });
    }

    const updatedHabit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { logs: true },
    });

    return NextResponse.json({ success: true, completed, habit: updatedHabit });
  } catch (err: any) {
    console.error("Habit toggle error:", err);
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 });
  }
}
