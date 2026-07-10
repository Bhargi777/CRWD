"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";

const wishlistSchema = z.object({ communityId: z.string().uuid() });

export async function toggleWishlist(input: z.infer<typeof wishlistSchema>) {
  const user = await requireAppUser();
  const { communityId } = wishlistSchema.parse(input);

  const existing = await prisma.wishlist.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { userId_communityId: { userId: user.id, communityId } },
    });
    return { wishlisted: false };
  }

  await prisma.wishlist.create({ data: { userId: user.id, communityId } });
  return { wishlisted: true };
}

export async function listUserWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { community: { include: { category: true } } },
  });
}
