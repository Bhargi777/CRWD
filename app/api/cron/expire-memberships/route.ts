import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { expireStaleMemberships } from "@/lib/memberships";

/**
 * Scheduled by Vercel Cron (see vercel.json, Phase 11) to flip ACTIVE
 * memberships past their expires_at to EXPIRED — recurring memberships
 * whose renewal payment never landed lose access on schedule rather than
 * staying ACTIVE indefinitely.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${requireEnv("CRON_SECRET")}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expiredCount = await expireStaleMemberships();
  return NextResponse.json({ expiredCount });
}
