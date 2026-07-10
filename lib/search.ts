import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { semanticSearchCommunities } from "@/lib/pinecone";
import type { Community } from "@prisma/client";

export type CommunitySearchResult = Community & {
  category: { name: string; slug: string };
  seller: { displayName: string; verified: boolean };
  score: number;
};

async function rankByCategoryAndSeller(
  ranked: { id: string; score: number }[],
): Promise<CommunitySearchResult[]> {
  if (ranked.length === 0) return [];

  const communities = await prisma.community.findMany({
    where: { id: { in: ranked.map((r) => r.id) }, status: "PUBLISHED" },
    include: { category: true, seller: { select: { displayName: true, verified: true } } },
  });

  const scoreById = new Map(ranked.map((r) => [r.id, r.score]));
  return communities
    .map((c) => ({ ...c, score: scoreById.get(c.id) ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

/** Trigram keyword match against title/description, published only. */
async function keywordSearchCommunities(
  query: string,
  limit: number,
): Promise<CommunitySearchResult[]> {
  const ranked = await prisma.$queryRaw<{ id: string; score: number }[]>`
    SELECT c.id,
           GREATEST(similarity(c.title, ${query}), similarity(c.description, ${query})) AS score
    FROM communities c
    WHERE c.status = 'PUBLISHED'
      AND (c.title % ${query} OR c.description % ${query})
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  return rankByCategoryAndSeller(ranked);
}

/**
 * Merges keyword + semantic (Pinecone) results, deduped by id, score desc.
 * `embedQuery` converts the query string into the vector Pinecone expects —
 * TECH_SPEC.md names Pinecone as the vector store but not an embeddings
 * provider, so callers pass one in once they've picked one; until then this
 * degrades to keyword-only search rather than issuing a meaningless
 * zero-length-vector query.
 */
export async function searchCommunities(
  query: string,
  limit = 20,
  embedQuery?: (text: string) => Promise<number[]>,
): Promise<CommunitySearchResult[]> {
  const keywordResults = await keywordSearchCommunities(query, limit);

  if (!env.PINECONE_API_KEY || !embedQuery) {
    return keywordResults;
  }

  try {
    const vector = await embedQuery(query);
    const matches = await semanticSearchCommunities(vector, limit);
    const seen = new Set(keywordResults.map((r) => r.id));
    const semanticOnly = matches
      .filter((m) => !seen.has(m.id))
      .map((m) => ({ id: m.id, score: m.score ?? 0 }));

    if (semanticOnly.length === 0) return keywordResults;

    const extraResults = await rankByCategoryAndSeller(semanticOnly);
    return [...keywordResults, ...extraResults].sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Semantic search failed, falling back to keyword-only", error);
    return keywordResults;
  }
}
