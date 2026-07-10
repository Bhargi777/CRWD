import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function listTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}
