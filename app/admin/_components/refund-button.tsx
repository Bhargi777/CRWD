"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refundPayment } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function RefundButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await refundPayment(paymentId);
        router.refresh();
      } catch {
        setError("Refund failed.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="destructive" onClick={handleClick} disabled={isPending}>
        {isPending ? "Refunding..." : "Refund"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
