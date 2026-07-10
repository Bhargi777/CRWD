import { listPendingCommunities } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { ModerationActions } from "./_components/moderation-actions";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const pending = await listPendingCommunities();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Moderation queue</h1>

      {pending.length === 0 ? (
        <EmptyState title="Nothing to review" description="New submissions will show up here." />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((community) => (
            <Card key={community.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{community.title}</p>
                <p className="text-sm text-muted-foreground">
                  {community.seller.displayName} · {community.category.name}
                </p>
                {community.seller.verified ? (
                  <Badge variant="success" className="mt-1">
                    Verified seller
                  </Badge>
                ) : null}
              </div>
              <ModerationActions communityId={community.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
