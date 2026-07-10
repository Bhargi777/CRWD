import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { activateMembership } from "@/lib/memberships";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotent on (provider, provider_payment_id) — safe under webhook retry.
    const payment = await prisma.payment.findUnique({
      where: { provider_providerPaymentId: { provider: "STRIPE", providerPaymentId: session.id } },
    });

    if (payment && payment.status === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCEEDED", webhookVerified: true },
      });
      await activateMembership(payment.id);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    await prisma.payment.updateMany({
      where: {
        provider: "STRIPE",
        providerPaymentId: session.id,
        status: "PENDING",
      },
      data: { status: "FAILED", webhookVerified: true },
    });
  }

  return NextResponse.json({ received: true });
}
