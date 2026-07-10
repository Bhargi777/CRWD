import Link from "next/link";
import { searchCommunities } from "@/lib/search";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchCommunities(query) : [];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <form action="/search" className="mb-8 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search communities..."
          className="h-11 flex-1 rounded-md border border-border bg-card px-4 text-sm"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
      </form>

      {!query ? (
        <EmptyState title="Search for a community" description="Try a topic, category, or keyword." />
      ) : results.length === 0 ? (
        <EmptyState
          title={`No results for "${query}"`}
          description="Try a different keyword or browse by category instead."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((community) => (
            <Link key={community.id} href={`/c/${community.slug}`}>
              <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{community.title}</h2>
                  <Badge variant="primary">{community.category.name}</Badge>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-auto text-sm text-muted-foreground">
                  by {community.seller.displayName}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
