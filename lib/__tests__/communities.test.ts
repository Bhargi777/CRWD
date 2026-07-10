import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/communities";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Startup Founders Club")).toBe("startup-founders-club");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("React & Next.js Devs!!")).toBe("react-next-js-devs");
  });

  it("collapses repeated separators", () => {
    expect(slugify("  Design   ---  Systems  ")).toBe("design-systems");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("---Crypto Traders---")).toBe("crypto-traders");
  });
});
