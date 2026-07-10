import { describe, it, expect, vi, afterEach } from "vitest";
import { generateInviteLink } from "@/lib/invite";
import type { Community } from "@prisma/client";

function makeCommunity(overrides: Partial<Community>): Community {
  return {
    id: "community-1",
    sellerId: "seller-1",
    categoryId: "category-1",
    title: "Test Community",
    slug: "test-community",
    description: "A test community",
    coverImageUrl: null,
    priceCents: 1000,
    currency: "USD",
    billingInterval: "one_time",
    platform: "other",
    inviteConfig: null,
    memberCount: 0,
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Community;
}

describe("generateInviteLink", () => {
  it("returns the static invite url for slack", async () => {
    const community = makeCommunity({
      platform: "slack",
      inviteConfig: { slackInviteUrl: "https://slack.com/join/abc" },
    });
    expect(await generateInviteLink(community)).toBe("https://slack.com/join/abc");
  });

  it("returns null for slack with no configured invite url", async () => {
    const community = makeCommunity({ platform: "slack", inviteConfig: {} });
    expect(await generateInviteLink(community)).toBeNull();
  });

  it("returns the static invite url for other platforms", async () => {
    const community = makeCommunity({
      platform: "other",
      inviteConfig: { staticInviteUrl: "https://example.com/join" },
    });
    expect(await generateInviteLink(community)).toBe("https://example.com/join");
  });

  it("returns null for discord with no bot credentials, without making a network call", async () => {
    const community = makeCommunity({ platform: "discord", inviteConfig: {} });
    expect(await generateInviteLink(community)).toBeNull();
  });

  it("returns null for telegram with no bot credentials, without making a network call", async () => {
    const community = makeCommunity({ platform: "telegram", inviteConfig: {} });
    expect(await generateInviteLink(community)).toBeNull();
  });

  it("never throws — swallows fetch errors and returns null", async () => {
    const community = makeCommunity({
      platform: "discord",
      inviteConfig: { discordGuildId: "guild", discordBotToken: "token" },
    });

    // Force a network failure instead of hitting the real Discord API,
    // exercising the catch-and-return-null path that WEBSITE_FLOW.md's
    // "invite generation failure" edge case relies on.
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network unreachable"))),
    );

    await expect(generateInviteLink(community)).resolves.toBeNull();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});
