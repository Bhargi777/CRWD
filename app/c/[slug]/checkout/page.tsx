import { notFound } from "next/navigation";
import { getCommunityBySlug } from "@/lib/communities";
import { Card } from "@/components/ui/card";
import { CheckoutButtons } from "./_checkout-buttons";

export const dynamic = "force-dynamic";

const STATUS_MESSAGE: Record<string, string> = {
  success: "Payment received — your membership is being activated. This can take a few seconds.",
  cancelled: "Checkout was cancelled. No charge was made.",
  processing: "Payment submitted — we're waiting for confirmation. Check your dashboard shortly.",
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const community = await getCommunityBySlug(slug);

  if (!community || community.status !== "PUBLISHED") {
    notFound();
  }

  const price = (community.priceCents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: community.currency,
  });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <Card>
        <h1 className="text-xl font-semibold">{community.title}</h1>
        <p className="mt-1 text-2xl font-semibold">
          {price}
          {community.billingInterval !== "one_time" ? (
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {community.billingInterval === "monthly" ? "month" : "year"}
            </span>
          ) : null}
        </p>

        {status && STATUS_MESSAGE[status] ? (
          <p className="mt-4 rounded-md bg-surface p-3 text-sm text-muted-foreground">
            {STATUS_MESSAGE[status]}
          </p>
        ) : null}

        <div className="mt-6">
          <CheckoutButtons
            communityId={community.id}
            communityTitle={community.title}
            slug={community.slug}
          />
        </div>
      </Card>
    </main>
  );
}
