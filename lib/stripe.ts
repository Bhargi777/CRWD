import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return client;
}
