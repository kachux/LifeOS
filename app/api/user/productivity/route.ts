import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch user items
    const [tasks, habits, todayHabitLogs, studySessions, transactions] = await Promise.all([
      prisma.task.findMany({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id } }),
      prisma.habitLog.findMany({ where: { userId: user.id, date: todayStr } }),
      prisma.studySession.findMany({ where: { userId: user.id } }),
      prisma.transaction.findMany({ where: { userId: user.id } }),
    ]);

    // 1. Task Score (completed / total)
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 75;

    // 2. Habit Score (today's completed habits / total habits)
    const totalHabits = habits.length;
    const completedHabitsToday = todayHabitLogs.filter((l) => l.completed).length;
    const habitScore = totalHabits > 0 ? Math.round((completedHabitsToday / totalHabits) * 100) : 80;

    // 3. Study / Focus Score (target: 60 mins/day)
    const todayStudyMinutes = studySessions
      .filter((s) => s.date.toISOString().split("T")[0] === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const studyScore = Math.min(100, Math.round((todayStudyMinutes / 60) * 100) || 70);

    // 4. Financial Discipline Score
    const financeScore = 85; // Baseline healthy budget score

    // Composite Score
    const compositeScore = Math.round(
      0.35 * taskScore + 0.30 * habitScore + 0.20 * studyScore + 0.15 * financeScore
    );

    // Save current score
    await prisma.user.update({
      where: { id: user.id },
      data: { productivityScore: compositeScore },
    });

    // 7-Day History Simulation for Graphs
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const history = days.map((day, idx) => ({
      day,
      score: Math.max(50, Math.min(98, compositeScore - 10 + (idx * 3) + ((idx % 2 === 0) ? 4 : -3))),
      tasks: Math.max(1, (idx + 2) % 6),
      focusMins: 25 * ((idx % 3) + 1),
    }));

    return NextResponse.json({
      productivityScore: compositeScore,
      breakdown: {
        taskScore,
        habitScore,
        studyScore,
        financeScore,
        completedTasks,
        totalTasks,
        completedHabitsToday,
        totalHabits,
        todayStudyMinutes,
      },
      history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to calculate productivity" }, { status: 500 });
  }
}
