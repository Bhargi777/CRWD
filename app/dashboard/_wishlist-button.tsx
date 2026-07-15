"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function WishlistRemoveButton({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    posthog.capture("wishlist_removed", { community_id: communityId });
    startTransition(async () => {
      await toggleWishlist({ communityId });
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      Remove
    </Button>
  );
}
