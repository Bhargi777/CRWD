"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getRazorpay } from "@/lib/razorpay";
import { getResend } from "@/lib/resend";
import { env } from "@/lib/env";

export async function approveCommunity(communityId: string) {
  await requireRole("ADMIN");
  return prisma.community.update({
    where: { id: communityId },
    data: { status: "PUBLISHED" },
  });
}

const rejectSchema = z.object({
  communityId: z.string().uuid(),
  reason: z.string().min(1).max(1000),
});

/**
 * Rejects a listing. SCHEMA.md's communities table has no rejection-reason
 * column, so the reason isn't persisted — it's relayed to the seller by
 * email (best-effort) rather than inventing an undocumented field.
 */
export async function rejectCommunity(input: z.infer<typeof rejectSchema>) {
  await requireRole("ADMIN");
  const { communityId, reason } = rejectSchema.parse(input);

  const community = await prisma.community.update({
    where: { id: communityId },
    data: { status: "REJECTED" },
    include: { seller: { include: { user: true } } },
  });

  if (env.RESEND_API_KEY) {
    try {
      await getResend().emails.send({
        from: "CRWD <listings@crwd.app>",
        to: community.seller.user.email,
        subject: `Your listing "${community.title}" needs changes`,
        html: `<p>Your listing was not approved for the following reason:</p><p>${reason}</p>`,
      });
    } catch (error) {
      console.error("Rejection email failed", { communityId, error });
    }
  }

  return community;
}

export async function suspendCommunity(communityId: string) {
  await requireRole("ADMIN");
  return prisma.community.update({
    where: { id: communityId },
    data: { status: "SUSPENDED" },
  });
}

const verifySellerSchema = z.object({
  sellerId: z.string().uuid(),
  verified: z.boolean(),
});

export async function setSellerVerified(input: z.infer<typeof verifySellerSchema>) {
  await requireRole("ADMIN");
  const { sellerId, verified } = verifySellerSchema.parse(input);
  return prisma.seller.update({ where: { id: sellerId }, data: { verified } });
}

/**
 * Issues a provider refund and marks the payment/membership REFUNDED.
 * Provider webhooks (charge.refunded / refund events) aren't wired to
 * double-confirm this — an admin-initiated refund is trusted input, unlike
 * inbound webhooks, which is why RULES.md's "verify webhooks" rule doesn't
 * apply here the same way.
 */
export async function refundPayment(paymentId: string) {
  await requireRole("ADMIN");

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "SUCCEEDED") throw new Error("Only succeeded payments can be refunded");

  if (payment.provider === "STRIPE") {
    await getStripe().refunds.create({ payment_intent: payment.providerPaymentId });
  } else {
    await getRazorpay().payments.refund(payment.providerPaymentId, {});
  }

  return prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } }),
    prisma.membership.updateMany({
      where: { paymentId: payment.id },
      data: { status: "REFUNDED" },
    }),
  ]);
}
