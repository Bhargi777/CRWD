import { Storage } from "@google-cloud/storage";
import { requireEnv } from "@/lib/env";

let storage: Storage | null = null;

function getStorage(): Storage {
  if (!storage) {
    const credentials = JSON.parse(requireEnv("GCS_SERVICE_ACCOUNT_JSON"));
    storage = new Storage({ credentials });
  }
  return storage;
}

/**
 * Returns a v4 signed PUT URL. Client uploads directly to GCS with this URL —
 * the file never passes through the app server (TECH_SPEC.md).
 */
export async function getSignedUploadUrl(params: {
  objectPath: string;
  contentType: string;
  expiresInMinutes?: number;
}) {
  const bucket = getStorage().bucket(requireEnv("GCS_BUCKET"));
  const file = bucket.file(params.objectPath);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + (params.expiresInMinutes ?? 15) * 60 * 1000,
    contentType: params.contentType,
  });

  const publicUrl = `https://storage.googleapis.com/${requireEnv("GCS_BUCKET")}/${params.objectPath}`;

  return { uploadUrl: url, publicUrl };
}
