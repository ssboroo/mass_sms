import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin эрх шаардлагатай." }, { status: 403 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const users = await db.user.findMany({
    where: q ? { OR: [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { organizationName: { contains: q, mode: "insensitive" } },
    ] } : {},
    orderBy: { createdAt: "desc" }, take: 100,
    select: {
      id: true, email: true, phone: true, fullName: true, organizationName: true,
      status: true, role: true, createdAt: true,
      creditAccount: { select: { id: true, balance: true, packageCode: true, packageCredits: true, updatedAt: true } },
      _count: { select: { campaigns: true, payments: true } },
    },
  });
  const [totalUsers, activeUsers, suspendedUsers, totals, payments] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.creditAccount.aggregate({ _sum: { balance: true } }),
    db.payment.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amountMnt: true } }),
  ]);
  return NextResponse.json({
    stats: { totalUsers, activeUsers, suspendedUsers, outstandingCredits: (totals._sum.balance ?? 0n).toString() },
    payments: payments.map(p => ({ status: p.status, count: p._count._all, amountMnt: (p._sum.amountMnt ?? 0n).toString() })),
    users: users.map(u => ({
      ...u, createdAt: u.createdAt.toISOString(),
      creditAccount: u.creditAccount ? { ...u.creditAccount, balance: u.creditAccount.balance.toString(), packageCredits: u.creditAccount.packageCredits.toString(), updatedAt: u.creditAccount.updatedAt.toISOString() } : null,
    })),
    admin: { id: admin.id, fullName: admin.fullName, email: admin.email, phone: admin.phone },
  });
}
