"use server";

import { z } from "zod";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const onboardSellerSchema = z.object({
  displayName: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
});

export async function onboardSeller(input: z.infer<typeof onboardSellerSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { displayName, bio } = onboardSellerSchema.parse(input);

  const seller = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role: "SELLER" } });
    return tx.seller.upsert({
      where: { userId },
      create: { userId, displayName, bio },
      update: { displayName, bio },
    });
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: "SELLER" },
  });

  return seller;
}
