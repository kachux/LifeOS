import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper: Luhn algorithm to validate credit/debit/RuPay card numbers
function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      gateway, // "card", "upi", "stripe", "paypal"
      planType, // "monthly" | "yearly"
      billingName,
      billingEmail,
      cardNumber,
      cardBrand,
      cardExp,
      cardCvc,
      upiId,
    } = await req.json();

    if (!billingName) {
      return NextResponse.json(
        { error: "Billing name is required" },
        { status: 400 }
      );
    }

    // Pricing in Indian Rupees (₹)
    const amount = planType === "yearly" ? 1100.0 : 99.0;
    const cleanCard = (cardNumber || "").replace(/\s/g, "");

    // Validate UPI payment
    if (gateway === "upi") {
      if (upiId && !upiId.includes("@")) {
        return NextResponse.json(
          { error: "Please enter a valid UPI ID (e.g., name@okhdfcbank, name@upi)" },
          { status: 400 }
        );
      }
    }

    // Validate card if card / stripe payment
    if (gateway === "card" || gateway === "stripe") {
      if (!cleanCard || cleanCard.length < 15) {
        return NextResponse.json(
          { error: "Please enter a valid 16-digit card number" },
          { status: 400 }
        );
      }
      if (!cardExp || !cardExp.includes("/")) {
        return NextResponse.json(
          { error: "Invalid expiry date (MM/YY)" },
          { status: 400 }
        );
      }
      if (!cardCvc || cardCvc.length < 3) {
        return NextResponse.json(
          { error: "Invalid CVV security code" },
          { status: 400 }
        );
      }

      // Check card expiration
      const [expMonth, expYear] = cardExp.split("/").map((s: string) => parseInt(s.trim(), 10));
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (expMonth < 1 || expMonth > 12 || expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        return NextResponse.json(
          { error: "Card has expired" },
          { status: 400 }
        );
      }
    }

    // Generate unique invoice number: INV-<timestamp-slice>-<random>
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const last4 = cleanCard ? cleanCard.slice(-4) : (gateway === "upi" ? "UPI" : "WAL");
    const detectedBrand = cardBrand || (gateway === "upi" ? "UPI / QR" : gateway === "paypal" ? "PayPal" : "RuPay/Card");

    // Create payment record in DB
    const record = await prisma.paymentRecord.create({
      data: {
        userId: user.id,
        invoiceNumber,
        gateway: gateway === "upi" ? "UPI" : gateway === "paypal" ? "PayPal" : "Stripe Card",
        planType: planType || "monthly",
        amount,
        currency: "INR",
        status: "PAID",
        cardBrand: detectedBrand,
        cardLast4: last4,
        upiId: upiId || null,
        billingName,
        billingEmail: billingEmail || `${user.username}@lifeos.in`,
      },
    });

    // Calculate subscription end date: 30 days for monthly, 365 days for yearly
    const durationDays = planType === "yearly" ? 365 : 30;
    const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd).getTime() : Date.now();
    const baseTime = Math.max(Date.now(), currentEnd);
    const newSubscriptionEnd = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);

    // Upgrade user to PRO
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tier: "PRO",
        subscriptionEnd: newSubscriptionEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to LifeOS Pro (${planType === "yearly" ? "₹1,100/yr" : "₹99/mo"})!`,
      invoice: record,
      subscriptionEnd: newSubscriptionEnd.toISOString(),
      amountFormatted: `₹${amount.toFixed(2)}`,
    });
  } catch (err: any) {
    console.error("Payment error:", err);
    return NextResponse.json(
      { error: err.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}
