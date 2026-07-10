"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getRazorpay } from "@/lib/razorpay";
import { env } from "@/lib/env";
import { checkoutRateLimit } from "@/lib/redis";

const checkoutSchema = z.object({
  communityId: z.string().uuid(),
});

async function loadPublishedCommunity(communityId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });
  if (!community || community.status !== "PUBLISHED") {
    throw new Error("Community not available for checkout");
  }
  return community;
}

/** Best-effort rate limit — skipped when Upstash isn't configured (local dev). */
async function enforceCheckoutRateLimit(identifier: string) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return;
  const { success } = await checkoutRateLimit().limit(identifier);
  if (!success) throw new Error("Too many checkout attempts. Try again in a minute.");
}

export async function createStripeCheckoutSession(input: z.infer<typeof checkoutSchema>) {
  const user = await requireAppUser();
  const { communityId } = checkoutSchema.parse(input);
  await enforceCheckoutRateLimit(user.id);

  const community = await loadPublishedCommunity(communityId);
  const stripe = getStripe();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: community.billingInterval === "one_time" ? "payment" : "subscription",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: community.currency.toLowerCase(),
          product_data: { name: community.title },
          unit_amount: community.priceCents,
          ...(community.billingInterval !== "one_time"
            ? { recurring: { interval: community.billingInterval === "monthly" ? "month" : "year" } }
            : {}),
        },
        quantity: 1,
      },
    ],
    metadata: { communityId: community.id, userId: user.id },
    success_url: `${origin}/c/${community.slug}/checkout?status=success`,
    cancel_url: `${origin}/c/${community.slug}/checkout?status=cancelled`,
  });

  if (!session.id) throw new Error("Stripe did not return a session id");

  await prisma.payment.create({
    data: {
      userId: user.id,
      communityId: community.id,
      provider: "STRIPE",
      providerPaymentId: session.id,
      amountCents: community.priceCents,
      currency: community.currency,
      status: "PENDING",
    },
  });

  return { redirectUrl: session.url };
}

export async function createRazorpayOrder(input: z.infer<typeof checkoutSchema>) {
  const user = await requireAppUser();
  const { communityId } = checkoutSchema.parse(input);
  await enforceCheckoutRateLimit(user.id);

  const community = await loadPublishedCommunity(communityId);
  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: community.priceCents,
    currency: community.currency,
    receipt: `${community.id}-${user.id}-${Date.now()}`,
    notes: { communityId: community.id, userId: user.id },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      communityId: community.id,
      provider: "RAZORPAY",
      providerPaymentId: order.id,
      amountCents: community.priceCents,
      currency: community.currency,
      status: "PENDING",
    },
  });

  return {
    orderId: order.id,
    amount: community.priceCents,
    currency: community.currency,
    keyId: env.RAZORPAY_KEY_ID,
  };
}
