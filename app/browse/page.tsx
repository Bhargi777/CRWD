import Link from "next/link";
import { listPublishedCommunities, type BrowseSort } from "@/lib/communities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: { value: BrowseSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Most popular" },
  { value: "price", label: "Price: low to high" },
  { value: "rating", label: "Top rated" },
];

function isBrowseSort(value: string | undefined): value is BrowseSort {
  return !!value && SORT_OPTIONS.some((option) => option.value === value);
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort = isBrowseSort(params.sort) ? params.sort : "newest";

  const { items } = await listPublishedCommunities({
    categorySlug: params.category,
    sort,
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Browse communities</h1>
        <div className="flex gap-2 text-sm">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/browse?${new URLSearchParams({
                ...(params.category ? { category: params.category } : {}),
                sort: option.value,
              }).toString()}`}
              className={
                option.value === sort
                  ? "rounded-md bg-primary px-3 py-1.5 text-primary-foreground"
                  : "rounded-md border border-border px-3 py-1.5 text-muted-foreground"
              }
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No communities found"
          description="Try a different category or check back soon — new listings are added often."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((community) => (
            <Link key={community.id} href={`/c/${community.slug}`}>
              <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{community.title}</h2>
                  <Badge variant="primary">{community.category.name}</Badge>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {community.description}
                </p>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {(community.priceCents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: community.currency,
                    })}
                    {community.billingInterval !== "one_time"
                      ? ` / ${community.billingInterval === "monthly" ? "mo" : "yr"}`
                      : ""}
                  </span>
                  <span className="text-muted-foreground">
                    {community.memberCount} members
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
