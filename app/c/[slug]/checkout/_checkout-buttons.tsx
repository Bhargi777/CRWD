"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStripeCheckoutSession, createRazorpayOrder } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("razorpay-checkout-js")) return resolve();
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

export function CheckoutButtons({
  communityId,
  communityTitle,
  slug,
}: {
  communityId: string;
  communityTitle: string;
  slug: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStripe() {
    setError(null);
    startTransition(async () => {
      try {
        const { redirectUrl } = await createStripeCheckoutSession({ communityId });
        if (redirectUrl) window.location.href = redirectUrl;
      } catch {
        setError("Couldn't start Stripe checkout. Try again.");
      }
    });
  }

  function handleRazorpay() {
    setError(null);
    startTransition(async () => {
      try {
        const order = await createRazorpayOrder({ communityId });
        await loadRazorpayScript();
        const razorpay = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: "CRWD",
          description: communityTitle,
          handler: () => {
            router.push(`/c/${slug}/checkout?status=processing`);
          },
        });
        razorpay.open();
      } catch {
        setError("Couldn't start Razorpay checkout. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={handleStripe} disabled={isPending} className="w-full">
        Pay with card (Stripe)
      </Button>
      <Button onClick={handleRazorpay} disabled={isPending} variant="secondary" className="w-full">
        Pay with UPI / Razorpay
      </Button>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
