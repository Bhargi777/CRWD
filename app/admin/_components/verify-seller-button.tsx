"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSellerVerified } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function VerifySellerButton({ sellerId, verified }: { sellerId: string; verified: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    posthog.capture("seller_verified", { seller_id: sellerId, verified: !verified });
    startTransition(async () => {
      await setSellerVerified({ sellerId, verified: !verified });
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant={verified ? "secondary" : "primary"} onClick={handleClick} disabled={isPending}>
      {verified ? "Unverify" : "Verify"}
    </Button>
  );
}
