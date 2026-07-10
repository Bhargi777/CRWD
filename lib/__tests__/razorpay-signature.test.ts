import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyRazorpaySignature } from "@/lib/razorpay";

describe("verifyRazorpaySignature", () => {
  const secret = "test_webhook_secret";
  const body = JSON.stringify({ event: "payment.captured" });
  const validSignature = createHmac("sha256", secret).update(body).digest("hex");

  it("accepts a correctly signed payload", () => {
    expect(verifyRazorpaySignature(body, validSignature, secret)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const tamperedBody = JSON.stringify({ event: "payment.failed" });
    expect(verifyRazorpaySignature(tamperedBody, validSignature, secret)).toBe(false);
  });

  it("rejects a signature from the wrong secret", () => {
    const wrongSignature = createHmac("sha256", "wrong_secret").update(body).digest("hex");
    expect(verifyRazorpaySignature(body, wrongSignature, secret)).toBe(false);
  });

  it("rejects a malformed signature without throwing", () => {
    expect(verifyRazorpaySignature(body, "not-a-real-signature", secret)).toBe(false);
  });
});
