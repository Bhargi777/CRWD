import { prisma } from "@/lib/prisma";

export async function getSellerByUserId(userId: string) {
  return prisma.seller.findUnique({ where: { userId } });
}

export async function getSellerDashboardSummary(sellerId: string) {
  const [communities, activeMemberships, revenue] = await Promise.all([
    prisma.community.count({ where: { sellerId } }),
    prisma.membership.count({
      where: { status: "ACTIVE", community: { sellerId } },
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", community: { sellerId } },
      _sum: { amountCents: true },
    }),
  ]);

  return {
    communityCount: communities,
    activeMemberCount: activeMemberships,
    revenueCents: revenue._sum.amountCents ?? 0,
  };
}

export async function listSellerCommunities(sellerId: string) {
  return prisma.community.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

export async function listSellerOrders(sellerId: string) {
  return prisma.payment.findMany({
    where: { community: { sellerId } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      community: { select: { title: true, slug: true } },
      membership: { select: { status: true, inviteUrl: true } },
    },
  });
}

export async function getSellerRevenueByMonth(sellerId: string, months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const payments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED", community: { sellerId }, createdAt: { gte: since } },
    select: { amountCents: true, createdAt: true },
  });

  const byMonth = new Map<string, number>();
  for (const payment of payments) {
    const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + payment.amountCents);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amountCents]) => ({ month, amountCents }));
}
