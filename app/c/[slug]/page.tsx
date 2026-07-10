import { notFound } from "next/navigation";
import Link from "next/link";
import { getCommunityBySlug } from "@/lib/communities";
import { getCurrentAppUser } from "@/lib/auth";
import { listCommunityReviews, getAverageRating, canUserReview } from "@/lib/reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewForm } from "./_review-form";

export const dynamic = "force-dynamic";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = await getCommunityBySlug(slug);

  if (!community || community.status !== "PUBLISHED") {
    notFound();
  }

  const [reviews, ratingSummary, currentUser] = await Promise.all([
    listCommunityReviews(community.id),
    getAverageRating(community.id),
    getCurrentAppUser(),
  ]);

  const myReview = currentUser ? reviews.find((r) => r.userId === currentUser.id) : undefined;
  const eligibleToReview = currentUser
    ? await canUserReview(currentUser.id, community.id)
    : false;

  const price = (community.priceCents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: community.currency,
  });

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="primary">{community.category.name}</Badge>
            {community.seller.verified ? (
              <Badge variant="success">Verified seller</Badge>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{community.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            by {community.seller.displayName} · {community.memberCount} members
          </p>
        </div>

        <p className="whitespace-pre-line text-base">{community.description}</p>

        {community.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {community.tags.map(({ tag }) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        ) : null}

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Reviews
            {ratingSummary.count > 0 ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {ratingSummary.average.toFixed(1)} ★ ({ratingSummary.count})
              </span>
            ) : null}
          </h2>

          {eligibleToReview ? (
            <div className="mb-4">
              <ReviewForm
                communityId={community.id}
                existingRating={myReview?.rating}
                existingBody={myReview?.body}
              />
            </div>
          ) : null}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{review.user.name ?? "Member"}</span>
                    <span className="text-warning">{"★".repeat(review.rating)}</span>
                  </div>
                  {review.body ? (
                    <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Card className="h-fit">
        <p className="text-2xl font-semibold">
          {price}
          {community.billingInterval !== "one_time" ? (
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {community.billingInterval === "monthly" ? "month" : "year"}
            </span>
          ) : null}
        </p>
        <Link href={`/c/${community.slug}/checkout`} className="mt-4 block">
          <Button className="w-full">Join community</Button>
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          Hosted on {community.platform}. Invite link delivered after payment.
        </p>
      </Card>
    </main>
  );
}
