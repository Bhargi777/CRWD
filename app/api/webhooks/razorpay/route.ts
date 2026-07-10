import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment: {
      entity: { id: string; order_id: string; status: string };
    };
  };
};

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const secret = requireEnv("RAZORPAY_WEBHOOK_SECRET");

  if (!verifySignature(body, signature, secret)) {
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
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCEEDED", webhookVerified: true },
      });
    }
  }

  if (event.event === "payment.failed") {
    const orderId = event.payload.payment.entity.order_id;
    await prisma.payment.updateMany({
      where: { provider: "RAZORPAY", providerPaymentId: orderId, status: "PENDING" },
      data: { status: "FAILED", webhookVerified: true },
    });
  }

  return NextResponse.json({ received: true });
}
