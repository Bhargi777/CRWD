import Link from "next/link";
import { requireAppUser } from "@/lib/auth";
import { getSellerByUserId, getSellerDashboardSummary, listSellerCommunities } from "@/lib/sellers";
import { OnboardingForm } from "./_components/onboarding-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  DRAFT: "default",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
} as const;

export default async function SellDashboardPage() {
  const user = await requireAppUser();
  const seller = await getSellerByUserId(user.id);

  if (!seller) {
    return <OnboardingForm />;
  }

  const [summary, communities] = await Promise.all([
    getSellerDashboardSummary(seller.id),
    listSellerCommunities(seller.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Listings</p>
          <p className="text-2xl font-semibold">{summary.communityCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Active members</p>
          <p className="text-2xl font-semibold">{summary.activeMemberCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Total revenue</p>
          <p className="text-2xl font-semibold">
            {(summary.revenueCents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your listings</h2>
          <Link href="/sell/listings/new" className="text-sm text-primary">
            + New listing
          </Link>
        </div>

        {communities.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="Create your first community listing to start accepting members."
            action={
              <Link href="/sell/listings/new" className="text-sm text-primary">
                Create a listing
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {communities.map((community) => (
              <Card key={community.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{community.title}</p>
                  <p className="text-sm text-muted-foreground">{community.category.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[community.status]}>{community.status}</Badge>
                  <Link
                    href={`/sell/listings/${community.id}/edit`}
                    className="text-sm text-primary"
                  >
                    Edit
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
