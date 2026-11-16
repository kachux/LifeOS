import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    const thisMonthTransactions = transactions.filter(
      (t) => new Date(t.date).toISOString().slice(0, 7) === currentMonthPrefix
    );

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + t.amount, 0);

    const thisMonthExpense = thisMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);

    return NextResponse.json({
      transactions,
      summary: {
        currentBalance: netBalance,
        totalIncome,
        totalExpense,
        thisMonthIncome,
        thisMonthExpense,
        savingsRate:
          totalIncome > 0
            ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
            : 0,
        currency: "₹",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch money balance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();

    if (!data.title || isNaN(parseFloat(data.amount))) {
      return NextResponse.json({ error: "Title and valid amount are required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        title: data.title,
        amount: Math.abs(parseFloat(data.amount)),
        type: data.type === "INCOME" ? "INCOME" : "EXPENSE",
        category: data.category || "General",
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes || "",
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });

    await prisma.transaction.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
