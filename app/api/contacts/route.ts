import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeMongolianPhone } from "@/lib/contacts";

export const dynamic = "force-dynamic";

const inputSchema = z.object({
  contacts: z.array(z.object({
    phone: z.string().trim().min(5).max(32),
    name: z.string().trim().max(100).optional().default(""),
    tags: z.array(z.string().trim().min(1).max(32)).max(20).optional().default([]),
  })).min(1).max(500),
  consentGranted: z.literal(true),
  consentSource: z.enum(["WEB_FORM", "PAPER_FORM", "CONTRACT", "IMPORT", "API", "OTHER"]).default("WEB_FORM"),
  evidence: z.string().trim().max(500).optional(),
});

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const page = Math.max(1, Math.min(10000, Number(url.searchParams.get("page") || "1") || 1));
  const where = {
    userId: user.id,
    ...(q ? { OR: [
      { displayName: { contains: q, mode: "insensitive" as const } },
      { phoneE164: { contains: q } },
      { tags: { has: q } },
    ] } : {}),
  };
  const [contacts, total] = await Promise.all([
    db.contact.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 50, take: 50,
      include: { consent: { orderBy: { capturedAt: "desc" }, take: 1, select: { granted: true, source: true, capturedAt: true, revokedAt: true } } },
    }),
    db.contact.count({ where }),
  ]);
  return NextResponse.json({
    contacts: contacts.map((contact) => ({
      id: contact.id, phone: contact.phoneE164, name: contact.displayName,
      tags: contact.tags, createdAt: contact.createdAt.toISOString(),
      consent: contact.consent[0] ? {
        granted: contact.consent[0].granted,
        source: contact.consent[0].source,
        capturedAt: contact.consent[0].capturedAt.toISOString(),
        revokedAt: contact.consent[0].revokedAt?.toISOString() ?? null,
      } : null,
    })),
    page, pageSize: 50, total,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Харилцагчийн мэдээлэл болон SMS хүлээн авах зөвшөөрлийг баталгаажуулна уу.", details: parsed.error.flatten() }, { status: 400 });
  }

  const unique = new Map<string, { phone: string; name: string; tags: string[] }>();
  const invalid: string[] = [];
  for (const item of parsed.data.contacts) {
    try {
      const phone = normalizeMongolianPhone(item.phone);
      unique.set(phone, { phone, name: item.name, tags: item.tags });
    } catch {
      invalid.push(item.phone);
    }
  }
  if (invalid.length) {
    return NextResponse.json({ error: "Зарим утасны дугаар буруу байна. 8 оронтой Монгол дугаар оруулна уу.", invalid }, { status: 400 });
  }

  const capturedAt = new Date();
  try {
    const result = await db.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      for (const item of unique.values()) {
        const existing = await tx.contact.findUnique({
          where: { userId_phoneE164: { userId: user.id, phoneE164: item.phone } },
          select: { id: true },
        });
        if (existing) {
          await tx.contact.update({
            where: { id: existing.id },
            data: {
              displayName: item.name || undefined,
              tags: item.tags.length ? item.tags : undefined,
              consent: { create: {
                userId: user.id, phoneE164: item.phone, granted: true,
                source: parsed.data.consentSource, evidence: parsed.data.evidence,
                capturedAt,
              } },
            },
          });
          updated++;
        } else {
          await tx.contact.create({
            data: {
              userId: user.id, phoneE164: item.phone,
              displayName: item.name || null, tags: item.tags,
              source: parsed.data.consentSource,
              consent: { create: {
                userId: user.id, phoneE164: item.phone, granted: true,
                source: parsed.data.consentSource, evidence: parsed.data.evidence,
                capturedAt,
              } },
            },
          });
          created++;
        }
      }
      return { created, updated, total: unique.size };
    });
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("Contact import failed", error);
    return NextResponse.json({ error: "Харилцагч хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}
