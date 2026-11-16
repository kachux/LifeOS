import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rawTasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const now = Date.now();

    const tasks = rawTasks.map((task) => {
      let daysLeft: number | null = null;
      let isToday = false;
      let isOverdue = false;
      let countdownText = "No deadline";

      if (task.dueDate) {
        const dueTime = new Date(task.dueDate).getTime();
        const diffMs = dueTime - now;
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
        isOverdue = diffMs < 0 && !isToday;

        if (task.status === "DONE") {
          countdownText = "Completed";
        } else if (isToday) {
          countdownText = "Due Today!";
        } else if (daysLeft === 1) {
          countdownText = "Due Tomorrow (1 day)";
        } else if (daysLeft > 1) {
          countdownText = `${daysLeft} days left`;
        } else if (isOverdue) {
          countdownText = `Overdue by ${Math.abs(daysLeft)} days`;
        }
      }

      return {
        ...task,
        daysLeft,
        isToday,
        isOverdue,
        countdownText,
      };
    });

    // Sort: Pending tasks with nearest deadlines first, then completed tasks
    tasks.sort((a, b) => {
      if (a.status !== "DONE" && b.status === "DONE") return -1;
      if (a.status === "DONE" && b.status !== "DONE") return 1;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    if (!data.title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description || "",
        priority: data.priority || "MEDIUM",
        status: data.status || "TODO",
        category: data.category || "General",
        eisenhower: data.eisenhower || "DO_FIRST",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, ...updates } = await req.json();
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const updated = await prisma.task.update({
      where: { id, userId: user.id },
      data: updates,
    });

    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

    await prisma.task.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
