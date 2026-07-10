import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

let client: Resend | null = null;

export function getResend(): Resend {
  if (!client) {
    client = new Resend(requireEnv("RESEND_API_KEY"));
  }
  return client;
}

export async function sendInviteEmail(params: {
  to: string;
  communityTitle: string;
  inviteUrl: string;
}) {
  const resend = getResend();
  return resend.emails.send({
    from: "CRWD <memberships@crwd.app>",
    to: params.to,
    subject: `Your invite to ${params.communityTitle}`,
    html: `<p>You're in! Join <strong>${params.communityTitle}</strong> using the link below:</p><p><a href="${params.inviteUrl}">${params.inviteUrl}</a></p>`,
  });
}
