import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await req.json(); // "monthly" | "yearly"
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      const stripe = new Stripe(stripeKey);
      const host = req.headers.get("origin") || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "LifeOS Pro Membership",
                description: "Unlimited AI Co-pilot, Deep Activity Analytics, Infinite Storage",
              },
              unit_amount: planType === "yearly" ? 8900 : 900,
              recurring: {
                interval: planType === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${host}/dashboard/billing?status=success`,
        cancel_url: `${host}/dashboard/billing?status=cancelled`,
        metadata: {
          userId: user.id,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Direct Development & Sandbox Pro Upgrade
    await prisma.user.update({
      where: { id: user.id },
      data: { tier: "PRO" },
    });

    return NextResponse.json({
      success: true,
      isPro: true,
      message: "Upgraded to LifeOS Pro (Sandbox Mode activated)",
      redirect: "/dashboard/billing?status=success",
    });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
