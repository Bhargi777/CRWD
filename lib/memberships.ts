import { prisma } from "@/lib/prisma";
import { generateInviteLink } from "@/lib/invite";
import { sendInviteEmail } from "@/lib/resend";
import { env } from "@/lib/env";
import type { BillingInterval } from "@prisma/client";

function computeExpiry(billingInterval: BillingInterval): Date | null {
  if (billingInterval === "one_time") return null;
  const expiresAt = new Date();
  if (billingInterval === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
  if (billingInterval === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  return expiresAt;
}

/**
 * Activates (or renews) a membership for a SUCCEEDED payment. Idempotent —
 * safe to call multiple times for the same payment (webhook retries) since
 * it no-ops once a membership already references payment.id.
 *
 * Never throws on invite/email failure — those degrade to a null invite_url
 * with a retry/support path (WEBSITE_FLOW.md "invite generation failure"),
 * they must not block payment confirmation.
 */
export async function activateMembership(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { community: true, user: true },
  });
  if (!payment || payment.status !== "SUCCEEDED") return;

  const alreadyProcessed = await prisma.membership.findUnique({ where: { paymentId } });
  if (alreadyProcessed) return;

  const priorMembership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId: payment.userId, communityId: payment.communityId } },
  });

  const expiresAt = computeExpiry(payment.community.billingInterval);

  const membership = await prisma.$transaction(async (tx) => {
    const result = await tx.membership.upsert({
      where: { userId_communityId: { userId: payment.userId, communityId: payment.communityId } },
      create: {
        userId: payment.userId,
        communityId: payment.communityId,
        paymentId: payment.id,
        status: "ACTIVE",
        expiresAt,
      },
      update: {
        status: "ACTIVE",
        expiresAt,
      },
    });

    if (!priorMembership) {
      await tx.community.update({
        where: { id: payment.communityId },
        data: { memberCount: { increment: 1 } },
      });
    }

    return result;
  });

  if (!membership.inviteUrl) {
    const inviteUrl = await generateInviteLink(payment.community);
    if (inviteUrl) {
      await prisma.membership.update({ where: { id: membership.id }, data: { inviteUrl } });
    }
  }

  if (env.RESEND_API_KEY) {
    const finalInviteUrl =
      membership.inviteUrl ??
      (await prisma.membership.findUnique({ where: { id: membership.id } }))?.inviteUrl;

    try {
      await sendInviteEmail({
        to: payment.user.email,
        communityTitle: payment.community.title,
        inviteUrl: finalInviteUrl ?? "Visit your CRWD dashboard to get your invite link.",
      });
    } catch (error) {
      console.error("Invite email failed", { membershipId: membership.id, error });
    }
  }
}

export async function listUserMemberships(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { community: { include: { category: true } } },
  });
}

/** Flips ACTIVE memberships past their expiry to EXPIRED. Called by the cron route. */
export async function expireStaleMemberships() {
  const result = await prisma.membership.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
  return result.count;
}
