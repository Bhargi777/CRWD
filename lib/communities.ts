import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type BrowseSort = "popularity" | "price" | "rating" | "newest";

export type BrowseFilters = {
  categorySlug?: string;
  tagNames?: string[];
  sort?: BrowseSort;
  page?: number;
  pageSize?: number;
};

const sortToOrderBy: Record<BrowseSort, Prisma.CommunityOrderByWithRelationInput> = {
  popularity: { memberCount: "desc" },
  price: { priceCents: "asc" },
  rating: { memberCount: "desc" }, // rating aggregate lands in Phase 8 (reviews)
  newest: { createdAt: "desc" },
};

export async function listPublishedCommunities(filters: BrowseFilters = {}) {
  const { categorySlug, tagNames, sort = "newest", page = 1, pageSize = 20 } = filters;

  const where: Prisma.CommunityWhereInput = {
    status: "PUBLISHED",
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(tagNames && tagNames.length > 0
      ? { tags: { some: { tag: { name: { in: tagNames } } } } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.community.findMany({
      where,
      orderBy: sortToOrderBy[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        seller: { select: { displayName: true, verified: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.community.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getCommunityBySlug(slug: string) {
  return prisma.community.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: { select: { displayName: true, bio: true, verified: true } },
      tags: { include: { tag: true } },
    },
  });
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
