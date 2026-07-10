import { notFound } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { getSellerByUserId, getSellerRevenueByMonth, getSellerDashboardSummary } from "@/lib/sellers";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";

export const dynamic = "force-dynamic";

export default async function SellerAnalyticsPage() {
  const user = await requireAppUser();
  const seller = await getSellerByUserId(user.id);
  if (!seller) notFound();

  const [summary, revenueByMonth] = await Promise.all([
    getSellerDashboardSummary(seller.id),
    getSellerRevenueByMonth(seller.id),
  ]);

  const maxRevenue = Math.max(...revenueByMonth.map((r) => r.amountCents), 1);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <Card>
          <p className="text-sm text-muted-foreground">Listings</p>
          <p className="text-2xl font-semibold">{summary.communityCount}</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Revenue, last 6 months</h2>
        {revenueByMonth.length === 0 ? (
          <EmptyState title="No revenue yet" description="Revenue trends appear once orders come in." />
        ) : (
          <div className="flex h-40 items-end gap-3">
            {revenueByMonth.map((row) => (
              <div key={row.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm bg-primary"
                  style={{ height: `${Math.max((row.amountCents / maxRevenue) * 100, 4)}%` }}
                />
                <span className="text-xs text-muted-foreground">{row.month}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Deeper funnel and conversion analytics are tracked in PostHog (TECH_SPEC.md).
      </p>
    </div>
  );
}
