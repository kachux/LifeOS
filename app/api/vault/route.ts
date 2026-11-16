import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documents = await prisma.documentItem.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, category, tags, isVault } = await req.json();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const doc = await prisma.documentItem.create({
      data: {
        userId: user.id,
        title,
        content: content || "",
        category: category || "General",
        tags: tags || "",
        isVault: !!isVault,
      },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, content, category, tags, isVault } = await req.json();
    const updated = await prisma.documentItem.update({
      where: { id, userId: user.id },
      data: {
        title,
        content,
        category,
        tags,
        isVault,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.documentItem.delete({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
