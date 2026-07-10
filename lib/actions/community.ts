"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";
import { slugify } from "@/lib/communities";

const communityInputSchema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(20).max(5000),
  categoryId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).max(10).default([]),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3),
  billingInterval: z.enum(["one_time", "monthly", "yearly"]),
  platform: z.enum(["discord", "slack", "telegram", "other"]),
  coverImageUrl: z.string().url().optional(),
});

async function assertSellerOwnsListing(communityId: string, sellerId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community || community.sellerId !== sellerId) {
    throw new Error("Forbidden");
  }
  return community;
}

async function requireSeller() {
  const user = await requireAppUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) throw new Error("Forbidden: not a seller");
  return seller;
}

export async function createCommunity(input: z.infer<typeof communityInputSchema>) {
  const seller = await requireSeller();
  const data = communityInputSchema.parse(input);

  const slug = `${slugify(data.title)}-${Math.random().toString(36).slice(2, 7)}`;

  return prisma.community.create({
    data: {
      sellerId: seller.id,
      categoryId: data.categoryId,
      title: data.title,
      slug,
      description: data.description,
      priceCents: data.priceCents,
      currency: data.currency,
      billingInterval: data.billingInterval,
      platform: data.platform,
      coverImageUrl: data.coverImageUrl,
      status: "DRAFT",
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  });
}

export async function updateCommunity(
  communityId: string,
  input: Partial<z.infer<typeof communityInputSchema>>,
) {
  const seller = await requireSeller();
  await assertSellerOwnsListing(communityId, seller.id);
  const data = communityInputSchema.partial().parse(input);

  const { tagIds, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    if (tagIds) {
      await tx.communityTag.deleteMany({ where: { communityId } });
      await tx.communityTag.createMany({
        data: tagIds.map((tagId) => ({ communityId, tagId })),
      });
    }
    return tx.community.update({ where: { id: communityId }, data: rest });
  });
}

export async function submitForReview(communityId: string) {
  const seller = await requireSeller();
  const community = await assertSellerOwnsListing(communityId, seller.id);

  if (community.status !== "DRAFT" && community.status !== "REJECTED") {
    throw new Error(`Cannot submit listing in status ${community.status} for review`);
  }

  return prisma.community.update({
    where: { id: communityId },
    data: { status: "PENDING_REVIEW" },
  });
}
