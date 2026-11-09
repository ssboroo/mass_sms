import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSmsPackage } from "@/lib/pricing";

export const runtime = "nodejs";

const schema = z.object({ packageId: z.enum(["starter", "basic", "standard", "business", "enterprise"]) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });
  const apiKey = process.env.WIRE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Төлбөрийн үйлчилгээ хараахан идэвхжээгүй байна. Админтай холбогдоно уу." }, { status: 503 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Багцын сонголт буруу байна." }, { status: 400 });
  const selected = getSmsPackage(parsed.data.packageId);
  if (!selected) return NextResponse.json({ error: "Багц олдсонгүй." }, { status: 404 });

  const idempotencyKey = randomUUID();
  const payment = await db.payment.create({
    data: {
      userId: user.id, provider: "WIRE",
      amountMnt: BigInt(selected.priceMnt),
      creditAmount: BigInt(selected.credits),
      idempotencyKey,
    },
    select: { id: true },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin;
  let intentId: string | undefined;
  try {
    const intentResponse = await fetch("https://api.wire.mn/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `mass-sms-${payment.id}-intent`,
      },
      body: JSON.stringify({
        amount: selected.priceMnt,
        currency: "MNT",
        description: `MASS SMS ${selected.name} — ${selected.credits} SMS credit`,
        metadata: { payment_id: payment.id, user_id: user.id, package_id: selected.id },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const intent = await intentResponse.json().catch(() => ({}));
    if (!intentResponse.ok || typeof intent.id !== "string") {
      throw new Error(typeof intent.error?.message === "string" ? intent.error.message : "WIRE_INTENT_CREATE_FAILED");
    }
    intentId = intent.id;

    const checkoutResponse = await fetch("https://api.wire.mn/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `mass-sms-${payment.id}-checkout`,
      },
      body: JSON.stringify({
        payment_intent: intentId,
        success_url: new URL("/?payment=success", baseUrl).toString(),
        cancel_url: new URL("/?payment=cancelled", baseUrl).toString(),
      }),
      signal: AbortSignal.timeout(15000),
    });
    const checkout = await checkoutResponse.json().catch(() => ({}));
    if (!checkoutResponse.ok || typeof checkout.url !== "string" || !checkout.url.startsWith("https://pay.wire.mn/")) {
      throw new Error(typeof checkout.error?.message === "string" ? checkout.error.message : "WIRE_CHECKOUT_CREATE_FAILED");
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { providerIntentId: intentId, checkoutUrl: checkout.url },
    });
    return NextResponse.json({ ok: true, checkoutUrl: checkout.url, paymentId: payment.id });
  } catch (error) {
    console.error("Wire checkout creation failed", error);
    await db.payment.update({
      where: { id: payment.id },
      data: { providerIntentId: intentId, status: "FAILED" },
    }).catch((updateError) => console.error("Could not mark failed Wire payment", updateError));
    return NextResponse.json({ error: "Төлбөрийн хуудас үүсгэж чадсангүй. Дахин оролдоно уу." }, { status: 502 });
  }
}
