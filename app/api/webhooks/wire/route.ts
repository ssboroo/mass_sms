import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWireSignature } from "@/lib/wire-signature";

export const runtime = "nodejs";

type WireEvent = {
  id?: string;
  type?: string;
  data?: { id?: string; amount?: number; currency?: string; status?: string };
};

export async function POST(request: Request) {
  const secret = process.env.WIRE_WEBHOOK_SECRET;
  const signature = request.headers.get("WirePayment-Signature") || "";
  const rawBody = await request.text();
  if (!secret || !verifyWireSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: WireEvent;
  try {
    event = JSON.parse(rawBody) as WireEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  if (!event.id || !event.type) return NextResponse.json({ error: "Invalid event envelope." }, { status: 400 });

  try {
    await db.$transaction(async (tx) => {
      await tx.webhookEvent.create({
        data: {
          provider: "WIRE",
          providerEventId: event.id!,
          eventType: event.type!,
          payload: JSON.parse(rawBody),
          processedAt: new Date(),
        },
      });

      const intentId = event.data?.id;
      if (!intentId) return;
      const payment = await tx.payment.findUnique({ where: { providerIntentId: intentId } });
      if (!payment) throw new Error("PAYMENT_NOT_FOUND");

      if (event.type === "payment_intent.succeeded") {
        if (event.data?.currency !== "MNT" || Number(event.data.amount) !== Number(payment.amountMnt)) {
          throw new Error("PAYMENT_AMOUNT_MISMATCH");
        }
        if (payment.status === "PAID") return;
        const packageCode = ({ "100": "STARTER", "500": "BASIC", "1000": "STANDARD", "5000": "BUSINESS", "10000": "ENTERPRISE" } as Record<string, string>)[payment.creditAmount.toString()] || "UNASSIGNED";
        const account = await tx.creditAccount.upsert({
          where: { userId: payment.userId },
          update: { balance: { increment: payment.creditAmount }, packageCode, packageCredits: { increment: payment.creditAmount } },
          create: {
            userId: payment.userId, balance: payment.creditAmount,
            packageCode, packageCredits: payment.creditAmount,
          },
          select: { id: true, balance: true },
        });
        await tx.creditLedger.create({
          data: {
            accountId: account.id,
            type: "TOP_UP",
            amount: payment.creditAmount,
            balanceAfter: account.balance,
            referenceType: "WIRE_PAYMENT",
            referenceId: payment.id,
            idempotencyKey: `wire:${event.id}`,
            description: "Verified Wire payment credit top-up",
          },
        });
        await tx.payment.update({ where: { id: payment.id }, data: { status: "PAID", paidAt: new Date() } });
      } else if (event.type === "payment_intent.payment_failed") {
        if (payment.status === "PENDING") await tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      } else if (event.type === "payment_intent.canceled") {
        if (payment.status === "PENDING") await tx.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED" } });
      }
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    console.error("Wire webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: code === "PAYMENT_NOT_FOUND" ? 404 : 500 });
  }
}
