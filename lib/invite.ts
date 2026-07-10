import type { Community } from "@prisma/client";

export type InviteConfig = {
  /** Discord: guild id + bot token used to create a one-time invite. */
  discordGuildId?: string;
  discordBotToken?: string;
  /** Slack: workspace invite link (static) or admin API token. */
  slackInviteUrl?: string;
  /** Telegram: bot token + chat id used to export a chat invite link. */
  telegramBotToken?: string;
  telegramChatId?: string;
  /** Fallback for `other` platform: a static link seller provides. */
  staticInviteUrl?: string;
};

/**
 * Generates (or fetches) a membership invite link for a community's external
 * platform. Best-effort — on failure the caller keeps the membership ACTIVE
 * with a null invite_url and surfaces a retry/support path (WEBSITE_FLOW.md
 * "invite generation failure" edge case), it must never block payment
 * confirmation.
 */
export async function generateInviteLink(community: Community): Promise<string | null> {
  const config = (community.inviteConfig ?? {}) as InviteConfig;

  try {
    switch (community.platform) {
      case "discord":
        return await createDiscordInvite(config);
      case "slack":
        return config.slackInviteUrl ?? null;
      case "telegram":
        return await createTelegramInvite(config);
      case "other":
        return config.staticInviteUrl ?? null;
      default:
        return null;
    }
  } catch (error) {
    console.error("Invite generation failed", { communityId: community.id, error });
    return null;
  }
}

async function createDiscordInvite(config: InviteConfig): Promise<string | null> {
  if (!config.discordGuildId || !config.discordBotToken) return null;

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${config.discordGuildId}/channels`,
    { headers: { Authorization: `Bot ${config.discordBotToken}` } },
  );
  if (!res.ok) throw new Error(`Discord API error: ${res.status}`);
  const channels = (await res.json()) as { id: string }[];
  const channelId = channels[0]?.id;
  if (!channelId) return null;

  const inviteRes = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${config.discordBotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_uses: 1, max_age: 86400 }),
    },
  );
  if (!inviteRes.ok) throw new Error(`Discord invite error: ${inviteRes.status}`);
  const invite = (await inviteRes.json()) as { code: string };
  return `https://discord.gg/${invite.code}`;
}

async function createTelegramInvite(config: InviteConfig): Promise<string | null> {
  if (!config.telegramBotToken || !config.telegramChatId) return null;

  const res = await fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/exportChatInviteLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: config.telegramChatId }),
    },
  );
  if (!res.ok) throw new Error(`Telegram API error: ${res.status}`);
  const data = (await res.json()) as { result: string };
  return data.result;
}
