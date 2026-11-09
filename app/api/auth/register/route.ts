import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { matchesAdminIdentifier, normalizeIdentifier } from "@/lib/account";

const schema = z.object({
  identifier: z.string().min(3).max(254),
  password: z.string().min(10).max(128),
  fullName: z.string().trim().min(2).max(100),
  organizationName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Мэдээллээ шалгана уу. Нууц үг хамгийн багадаа 10 тэмдэгт байна." }, { status: 400 });
    const { identifier, password, fullName, organizationName } = parsed.data;
    let identity: ReturnType<typeof normalizeIdentifier>;
    try { identity = normalizeIdentifier(identifier); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid identifier" }, { status: 400 }); }

    const existing = await db.user.findFirst({ where: { OR: [ ...(identity.email ? [{ email: identity.email }] : []), ...(identity.phone ? [{ phone: identity.phone }] : []) ] } });
    if (existing) return NextResponse.json({ error: "Энэ и-мэйл эсвэл утасны дугаар бүртгэлтэй байна." }, { status: 409 });

    const isAdmin = matchesAdminIdentifier(identity, { email: process.env.ADMIN_EMAIL, phone: process.env.ADMIN_PHONE });
    const user = await db.user.create({
      data: {
        email: identity.email ?? null, phone: identity.phone ?? null,
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
