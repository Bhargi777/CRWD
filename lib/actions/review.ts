"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";
import { canUserReview } from "@/lib/reviews";

const reviewSchema = z.object({
  communityId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(2000).optional(),
});

export async function submitReview(input: z.infer<typeof reviewSchema>) {
  const user = await requireAppUser();
  const { communityId, rating, body } = reviewSchema.parse(input);

  const eligible = await canUserReview(user.id, communityId);
  if (!eligible) {
    throw new Error("Only members can review this community");
  }

  return prisma.review.upsert({
    where: { userId_communityId: { userId: user.id, communityId } },
    create: { userId: user.id, communityId, rating, body },
    update: { rating, body },
  });
}
