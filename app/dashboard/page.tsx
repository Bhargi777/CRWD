import Link from "next/link";
import { requireAppUser } from "@/lib/auth";
import { listUserMemberships } from "@/lib/memberships";
import { listUserWishlist } from "@/lib/actions/wishlist";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { RegenerateInviteButton } from "./_regenerate-invite-button";
import { WishlistRemoveButton } from "./_wishlist-button";

export const dynamic = "force-dynamic";

const MEMBERSHIP_STATUS_VARIANT = {
  ACTIVE: "success",
  EXPIRED: "default",
  CANCELLED: "default",
  REFUNDED: "danger",
} as const;

export default async function DashboardPage() {
  const user = await requireAppUser();
  const [memberships, wishlist] = await Promise.all([
    listUserMemberships(user.id),
    listUserWishlist(user.id),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <section>
        <h1 className="mb-6 text-xl font-semibold">Your memberships</h1>
        {memberships.length === 0 ? (
          <EmptyState
            title="No memberships yet"
            description="Join a community to see it here."
            action={
              <Link href="/browse" className="text-sm text-primary">
                Browse communities
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {memberships.map((membership) => (
              <Card key={membership.id} className="flex items-center justify-between gap-4">
                <div>
                  <Link href={`/c/${membership.community.slug}`} className="font-medium hover:underline">
                    {membership.community.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{membership.community.category.name}</p>
                  <Badge variant={MEMBERSHIP_STATUS_VARIANT[membership.status]} className="mt-2">
                    {membership.status}
                  </Badge>
                </div>
                {membership.status === "ACTIVE" ? (
                  membership.inviteUrl ? (
                    <div className="flex flex-col items-end gap-1">
                      <a
                        href={membership.inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary"
                      >
                        Open invite
                      </a>
                      <RegenerateInviteButton membershipId={membership.id} />
                    </div>
                  ) : (
                    <RegenerateInviteButton membershipId={membership.id} />
                  )
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">Wishlist</h2>
        {wishlist.length === 0 ? (
          <EmptyState title="Your wishlist is empty" description="Save communities to revisit them later." />
        ) : (
          <div className="flex flex-col gap-3">
            {wishlist.map((item) => (
              <Card key={item.communityId} className="flex items-center justify-between">
                <div>
                  <Link href={`/c/${item.community.slug}`} className="font-medium hover:underline">
                    {item.community.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.community.category.name}</p>
                </div>
                <WishlistRemoveButton communityId={item.communityId} />
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
