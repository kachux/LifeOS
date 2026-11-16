import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { apiKey, provider = "gemini" } = await req.json();
    if (!apiKey) {
      // Allow clearing the key
      await prisma.user.update({
        where: { id: user.id },
        data: { userApiKey: null, aiProvider: provider },
      });
      return NextResponse.json({
        success: true,
        message: "API key cleared. Built-in LifeOS AI is active.",
      });
    }

    const cleanKey = apiKey.trim();

    // 1. Google Gemini Test
    if (provider === "gemini" || cleanKey.startsWith("AIza") || cleanKey.startsWith("AQ") || !cleanKey.startsWith("sk-")) {
      try {
        const testModels = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest", "gemini-1.5-flash"];
        let successModel: string | null = null;
        let lastError = "";

        for (const m of testModels) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cleanKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ role: "user", parts: [{ text: "ping" }] }],
                }),
              }
            );
            if (res.ok) {
              successModel = m;
              break;
            } else {
              const errData = await res.json();
              lastError = errData.error?.message || `Model ${m} failed`;
            }
          } catch (e: any) {
            lastError = e?.message || "Connection error";
          }
        }

        if (successModel) {
          // Permanently save verified key to database
          await prisma.user.update({
            where: { id: user.id },
            data: { userApiKey: cleanKey, aiProvider: "gemini" },
          });

          return NextResponse.json({
            success: true,
            provider: `Google Gemini (${successModel})`,
            message: `Connected & Saved! Google Gemini is now powering your AI Assistant.`,
          });
        } else {
          return NextResponse.json(
            { success: false, error: lastError || "Invalid Google Gemini API key" },
            { status: 400 }
          );
        }
      } catch (e: any) {
        return NextResponse.json(
          { success: false, error: "Network error reaching Google Gemini" },
          { status: 500 }
        );
      }
    }

    // 2. OpenAI Test
    if (provider === "openai" || cleanKey.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cleanKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5,
          }),
        });
        if (res.ok) {
          // Permanently save verified key to database
          await prisma.user.update({
            where: { id: user.id },
            data: { userApiKey: cleanKey, aiProvider: "openai" },
          });

          return NextResponse.json({
            success: true,
            provider: "OpenAI GPT-4o-mini",
            message: "Connected & Saved! OpenAI ChatGPT is now powering your AI.",
          });
        } else {
          const errData = await res.json();
          return NextResponse.json(
            { success: false, error: errData.error?.message || "Invalid OpenAI API key" },
            { status: 400 }
          );
        }
      } catch (e: any) {
        return NextResponse.json(
          { success: false, error: "Network error reaching OpenAI" },
          { status: 500 }
        );
      }
    }

    // Default save for other providers
    await prisma.user.update({
      where: { id: user.id },
      data: { userApiKey: cleanKey, aiProvider: provider },
    });

    return NextResponse.json({
      success: true,
      provider: "Custom Provider",
      message: "API key saved and configured.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Network error testing API key" }, { status: 500 });
  }
}
