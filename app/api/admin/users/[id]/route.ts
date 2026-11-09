import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseCreditAdjustment } from "@/lib/account";

const packages = ["UNASSIGNED", "STARTER", "BASIC", "STANDARD", "BUSINESS", "ENTERPRISE"] as const;
const schema = z.object({
  packageCode: z.enum(packages).optional(),
  creditAdjustment: z.number().int().safe().min(-10_000_000).max(10_000_000).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin эрх шаардлагатай." }, { status: 403 });
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || Object.values(parsed.data ?? {}).every(v => v === undefined)) {
    return NextResponse.json({ error: "Өөрчлөх утгаа зөв оруулна уу." }, { status: 400 });
  }
  try {
    const result = await db.$transaction(async tx => {
      const user = await tx.user.findUnique({ where: { id }, include: { creditAccount: true } });
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.id === admin.id && parsed.data.status === "SUSPENDED") throw new Error("CANNOT_SUSPEND_SELF");
      if (parsed.data.status) await tx.user.update({ where: { id }, data: { status: parsed.data.status } });
      let account = user.creditAccount;
      if (!account && (parsed.data.packageCode || parsed.data.creditAdjustment !== undefined)) {
        account = await tx.creditAccount.create({ data: { userId: id, balance: 0n, packageCode: "UNASSIGNED", packageCredits: 0n } });
      }
      if (account && parsed.data.packageCode) {
        account = await tx.creditAccount.update({ where: { id: account.id }, data: { packageCode: parsed.data.packageCode } });
      }
      if (account && parsed.data.creditAdjustment !== undefined) {
        const amount = parseCreditAdjustment(parsed.data.creditAdjustment);
        const nextBalance = account.balance + amount;
        if (nextBalance < 0n) throw new Error("INSUFFICIENT_BALANCE");
        account = await tx.creditAccount.update({ where: { id: account.id }, data: { balance: nextBalance } });
        await tx.creditLedger.create({ data: {
          accountId: account.id, type: "MANUAL_ADJUSTMENT", amount, balanceAfter: nextBalance,
          referenceType: "ADMIN_ADJUSTMENT", referenceId: id, idempotencyKey: randomUUID(),
          description: `Admin adjustment by ${admin.id}`,
        } });
      }
      return { status: parsed.data.status ?? user.status, creditAccount: account ? {
        balance: account.balance.toString(), packageCode: account.packageCode,
        packageCredits: account.packageCredits.toString(),
      } : null };
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "USER_NOT_FOUND" ? 404 : message === "INSUFFICIENT_BALANCE" ? 409 : 400;
    return NextResponse.json({ error: message === "USER_NOT_FOUND" ? "Хэрэглэгч олдсонгүй." : message === "INSUFFICIENT_BALANCE" ? "Үлдэгдэл сөрөг болох боломжгүй." : "Өөрчлөлт хийх боломжгүй." }, { status });
  }
}
