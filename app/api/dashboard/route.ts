import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });

  const [account, campaignCount, recipientCounts, campaigns, campaignRecipientCounts] = await Promise.all([
    db.creditAccount.findUnique({ where: { userId: user.id }, select: { balance: true, packageCode: true } }),
    db.smsCampaign.count({ where: { userId: user.id } }),
    db.smsRecipient.groupBy({
      by: ["status"], where: { campaign: { userId: user.id } },
      _count: { _all: true },
    }),
    db.smsCampaign.findMany({
      where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, name: true, status: true, recipientCount: true, createdAt: true },
    }),
    db.smsRecipient.groupBy({
      by: ["campaignId", "status"], where: { campaign: { userId: user.id } },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(recipientCounts.map((row) => [row.status, row._count._all])) as Record<string, number>;
  const recentCampaigns = campaigns.map((campaign) => {
    const perStatus = campaignRecipientCounts.filter((row) => row.campaignId === campaign.id);
    const delivered = perStatus.filter((row) => row.status === "DELIVERED").reduce((sum, row) => sum + row._count._all, 0);
    const sent = perStatus.filter((row) => row.status === "SENT" || row.status === "DELIVERED").reduce((sum, row) => sum + row._count._all, 0);
    const failed = perStatus.filter((row) => row.status === "FAILED" || row.status === "REJECTED").reduce((sum, row) => sum + row._count._all, 0);
    return {
      id: campaign.id, name: campaign.name || "Нэргүй кампанит ажил",
      status: campaign.status, recipients: campaign.recipientCount,
      sent, delivered, failed, createdAt: campaign.createdAt.toISOString(),
    };
  });

  const sent = (counts.SENT || 0) + (counts.DELIVERED || 0);
  const delivered = counts.DELIVERED || 0;
  const failed = (counts.FAILED || 0) + (counts.REJECTED || 0);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return NextResponse.json({
    stats: {
      sent, delivered, failed, pending: counts.PENDING || 0,
      campaigns: campaignCount, recipients: total,
      deliveryRate: sent ? Math.round((delivered / sent) * 1000) / 10 : 0,
    },
    credits: account?.balance.toString() ?? "0",
    packageCode: account?.packageCode ?? "UNASSIGNED",
    recentCampaigns,
    source: "database",
  });
}
