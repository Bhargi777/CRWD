"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { getSignedUploadUrl } from "@/lib/gcs";
import { requireAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requestUploadSchema = z.object({
  contentType: z.enum(["image/png", "image/jpeg", "image/webp"]),
});

/**
 * Issues a GCS signed PUT URL for a cover image upload. The client uploads
 * directly to GCS with the returned URL — the file never passes through the
 * app server (TECH_SPEC.md). Only sellers may request one.
 */
export async function requestCoverImageUpload(input: z.infer<typeof requestUploadSchema>) {
  const user = await requireAppUser();
  const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
  if (!seller) throw new Error("Forbidden: not a seller");

  const { contentType } = requestUploadSchema.parse(input);
  const extension = contentType.split("/")[1];
  const objectPath = `communities/${seller.id}/${randomUUID()}.${extension}`;

  return getSignedUploadUrl({ objectPath, contentType });
}
