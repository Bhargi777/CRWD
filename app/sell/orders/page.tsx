import { notFound } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { getSellerByUserId, listSellerOrders } from "@/lib/sellers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";

export const dynamic = "force-dynamic";

const PAYMENT_STATUS_VARIANT = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  REFUNDED: "default",
} as const;

export default async function SellerOrdersPage() {
  const user = await requireAppUser();
  const seller = await getSellerByUserId(user.id);
  if (!seller) notFound();

  const orders = await listSellerOrders(seller.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders will show up here once buyers start joining your communities."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.community.title}</p>
                <p className="text-sm text-muted-foreground">
                  {order.user.name ?? order.user.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {(order.amountCents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: order.currency,
                  })}
                </span>
                <Badge variant={PAYMENT_STATUS_VARIANT[order.status]}>{order.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
