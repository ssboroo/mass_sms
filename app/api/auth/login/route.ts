import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { normalizeIdentifier } from "@/lib/account";

const schema = z.object({ identifier: z.string().min(3).max(254), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Нэвтрэх мэдээллээ шалгана уу." }, { status: 400 });
    let identity: ReturnType<typeof normalizeIdentifier>;
    try { identity = normalizeIdentifier(parsed.data.identifier); }
    catch { return NextResponse.json({ error: "Нэвтрэх мэдээлэл буруу байна." }, { status: 401 }); }
    const user = await db.user.findFirst({
      where: identity.email ? { email: identity.email } : { phone: identity.phone },
    });
    if (!user || user.status !== "ACTIVE" || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({ error: "Нэвтрэх мэдээлэл буруу байна." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, email: user.email, phone: user.phone, fullName: user.fullName, role: user.role } });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Нэвтрэх үед алдаа гарлаа." }, { status: 500 });
  }
}
