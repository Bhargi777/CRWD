import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEnv } from "@/lib/env";
import { getPostHogClient } from "@/lib/posthog-server";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { id: string; email_address: string }[];
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
};

export async function POST(req: Request) {
  const secret = requireEnv("CLERK_WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
      event.data;
    const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id);

    if (!primaryEmail) {
      return NextResponse.json({ error: "No primary email" }, { status: 400 });
    }

    const isNew = event.type === "user.created";

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: primaryEmail.email_address,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        avatarUrl: image_url,
      },
      update: {
        email: primaryEmail.email_address,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
        avatarUrl: image_url,
      },
    });

    if (isNew) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: id,
        event: "user_signed_up",
      });
      posthog.identify({
        distinctId: id,
        properties: {
          email: primaryEmail.email_address,
          name: [first_name, last_name].filter(Boolean).join(" ") || undefined,
        },
      });
      await posthog.flush();
    }
  }

  if (event.type === "user.deleted") {
    await prisma.user.deleteMany({ where: { id: event.data.id } });
  }

  return NextResponse.json({ received: true });
}
