import { listRecentPayments } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { RefundButton } from "../_components/refund-button";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  REFUNDED: "default",
} as const;

export default async function AdminReportsPage() {
  const payments = await listRecentPayments();

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Reports & disputes</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        No dedicated report queue is modeled yet (SCHEMA.md has no reports table) — this
        view is the practical dispute-resolution surface: recent payments with a manual
        refund action. Suspend a listing from the moderation queue for repeat offenders.
      </p>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{payment.community.title}</p>
                <p className="text-sm text-muted-foreground">
                  {payment.user.name ?? payment.user.email} ·{" "}
                  {(payment.amountCents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: payment.currency,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[payment.status]}>{payment.status}</Badge>
                {payment.status === "SUCCEEDED" ? <RefundButton paymentId={payment.id} /> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
