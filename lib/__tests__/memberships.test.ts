import { describe, it, expect } from "vitest";
import { computeExpiry } from "@/lib/memberships";

describe("computeExpiry", () => {
  it("returns null for one_time billing (lifetime access)", () => {
    expect(computeExpiry("one_time")).toBeNull();
  });

  it("returns a date ~1 month out for monthly billing", () => {
    const now = new Date();
    const expiry = computeExpiry("monthly");
    expect(expiry).not.toBeNull();

    const expectedMonth = new Date(now);
    expectedMonth.setMonth(expectedMonth.getMonth() + 1);
    expect(expiry?.getMonth()).toBe(expectedMonth.getMonth());
  });

  it("returns a date ~1 year out for yearly billing", () => {
    const now = new Date();
    const expiry = computeExpiry("yearly");
    expect(expiry).not.toBeNull();
    expect(expiry?.getFullYear()).toBe(now.getFullYear() + 1);
  });
});
