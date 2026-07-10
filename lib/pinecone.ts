import { Pinecone } from "@pinecone-database/pinecone";
import { requireEnv } from "@/lib/env";

let client: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!client) {
    client = new Pinecone({ apiKey: requireEnv("PINECONE_API_KEY") });
  }
  return client;
}

export function getCommunityIndex() {
  return getPinecone().index(requireEnv("PINECONE_INDEX"));
}

export async function upsertCommunityEmbedding(params: {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
}) {
  const index = getCommunityIndex();
  await index.upsert([{ id: params.id, values: params.values, metadata: params.metadata }]);
}

export async function semanticSearchCommunities(vector: number[], topK = 20) {
  const index = getCommunityIndex();
  const result = await index.query({ vector, topK, includeMetadata: true });
  return result.matches ?? [];
}
