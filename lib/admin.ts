import { prisma } from "@/lib/prisma";

export async function listPendingCommunities() {
  return prisma.community.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: { seller: { select: { displayName: true, verified: true } }, category: true },
  });
}

export async function listSellersForVerification() {
  return prisma.seller.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { communities: true } } },
  });
}

export async function listRecentPayments(limit = 50) {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { email: true, name: true } },
      community: { select: { title: true, slug: true, sellerId: true } },
    },
  });
}
