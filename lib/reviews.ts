import { prisma } from "@/lib/prisma";

export async function listCommunityReviews(communityId: string) {
  return prisma.review.findMany({
    where: { communityId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, avatarUrl: true } } },
  });
}

export async function getAverageRating(communityId: string) {
  const result = await prisma.review.aggregate({
    where: { communityId },
    _avg: { rating: true },
    _count: true,
  });
  return { average: result._avg.rating ?? 0, count: result._count };
}

/** A user may review a community only if they have (or had) a membership on it. */
export async function canUserReview(userId: string, communityId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });
  return !!membership;
}
