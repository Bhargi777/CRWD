"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";
import { generateInviteLink } from "@/lib/invite";

const membershipIdSchema = z.object({ membershipId: z.string().uuid() });

/** Regenerates a stale invite link (e.g. an expired Discord invite). */
export async function regenerateInviteLink(input: z.infer<typeof membershipIdSchema>) {
  const user = await requireAppUser();
  const { membershipId } = membershipIdSchema.parse(input);

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { community: true },
  });

  if (!membership || membership.userId !== user.id) {
    throw new Error("Forbidden");
  }
  if (membership.status !== "ACTIVE") {
    throw new Error("Membership is not active");
  }

  const inviteUrl = await generateInviteLink(membership.community);
  if (!inviteUrl) {
    throw new Error("Couldn't generate an invite link right now");
  }

  return prisma.membership.update({ where: { id: membershipId }, data: { inviteUrl } });
}
