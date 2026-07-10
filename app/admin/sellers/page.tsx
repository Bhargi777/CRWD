import { listSellersForVerification } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";
import { VerifySellerButton } from "../_components/verify-seller-button";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage() {
  const sellers = await listSellersForVerification();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Sellers</h1>

      {sellers.length === 0 ? (
        <EmptyState title="No sellers yet" />
      ) : (
        <div className="flex flex-col gap-3">
          {sellers.map((seller) => (
            <Card key={seller.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{seller.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {seller._count.communities} listing{seller._count.communities === 1 ? "" : "s"}
                </p>
                {seller.verified ? <Badge variant="success" className="mt-1">Verified</Badge> : null}
              </div>
              <VerifySellerButton sellerId={seller.id} verified={seller.verified} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
