import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { matchesAdminIdentifier, normalizeIdentifier } from "@/lib/account";

const schema = z.object({
  email: z.string().trim().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  password: z.string().min(10).max(128),
  fullName: z.string().trim().min(2).max(100),
  organizationName: z.string().trim().max(120).optional(),
}).refine(value => Boolean(value.email || value.phone), { message: "Email or phone is required" });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "И-мэйл эсвэл утасны дугаарын аль нэгийг зөв оруулж, 10-аас дээш тэмдэгттэй нууц үг сонгоно уу." }, { status: 400 });
    const { email, phone, password, fullName, organizationName } = parsed.data;
    let normalizedEmail: string | null = null;
    let normalizedPhone: string | null = null;
    try {
      if (email) normalizedEmail = normalizeIdentifier(email).email ?? null;
      if (phone) normalizedPhone = normalizeIdentifier(phone).phone ?? null;
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid contact details" }, { status: 400 });
    }
    const identity = { email: normalizedEmail ?? undefined, phone: normalizedPhone ?? undefined };
    const existing = await db.user.findFirst({ where: { OR: [
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
    ] } });
    if (existing) return NextResponse.json({ error: "Энэ и-мэйл эсвэл утасны дугаар бүртгэлтэй байна." }, { status: 409 });

    const isAdmin = matchesAdminIdentifier(identity, { email: process.env.ADMIN_EMAIL, phone: process.env.ADMIN_PHONE });
    const user = await db.user.create({
      data: {
        email: normalizedEmail, phone: normalizedPhone,
        passwordHash: hashPassword(password), fullName, organizationName: organizationName || null,
        status: "ACTIVE", role: isAdmin ? "ADMIN" : "USER",
        creditAccount: { create: { balance: 0n, packageCode: "UNASSIGNED", packageCredits: 0n } },
      },
      select: { id: true, email: true, phone: true, fullName: true, role: true, status: true },
    });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Бүртгэл үүсгэхэд алдаа гарлаа." }, { status: 500 });
  }
}
