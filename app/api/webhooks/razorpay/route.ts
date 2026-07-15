import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { activateMembership } from "@/lib/memberships";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getPostHogClient } from "@/lib/posthog-server";

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment: {
      entity: { id: string; order_id: string; status: string };
    };
  };
};

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const secret = requireEnv("RAZORPAY_WEBHOOK_SECRET");

  if (!verifyRazorpaySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as RazorpayWebhookEvent;

  if (event.event === "payment.captured") {
    const orderId = event.payload.payment.entity.order_id;

    // Idempotent on (provider, provider_payment_id) — safe under webhook retry.
    const payment = await prisma.payment.findUnique({
      where: { provider_providerPaymentId: { provider: "RAZORPAY", providerPaymentId: orderId } },
    });

    if (payment && payment.status === "PENDING") {
      // Swap the correlation key (order id) for the actual payment id —
      // that's what Razorpay's refund API takes (lib/actions/admin.ts),
      // order ids aren't refundable.
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          webhookVerified: true,
          providerPaymentId: event.payload.payment.entity.id,
        },
      });
      await activateMembership(payment.id);

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: payment.userId,
        event: "payment_succeeded",
        properties: {
          provider: "razorpay",
          community_id: payment.communityId,
          amount_cents: payment.amountCents,
          currency: payment.currency,
        },
      });
      await posthog.flush();
    }
  }

  if (event.event === "payment.failed") {
    const orderId = event.payload.payment.entity.order_id;
    const failed = await prisma.payment.findFirst({
      where: { provider: "RAZORPAY", providerPaymentId: orderId, status: "PENDING" },
    });
    await prisma.payment.updateMany({
      where: { provider: "RAZORPAY", providerPaymentId: orderId, status: "PENDING" },
      data: { status: "FAILED", webhookVerified: true },
    });
    if (failed) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: failed.userId,
        event: "payment_failed",
        properties: {
          provider: "razorpay",
          community_id: failed.communityId,
          amount_cents: failed.amountCents,
          currency: failed.currency,
        },
      });
      await posthog.flush();
    }
  }

  return NextResponse.json({ received: true });
}
