"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSellerVerified } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function VerifySellerButton({ sellerId, verified }: { sellerId: string; verified: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
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
