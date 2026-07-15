"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateInviteLink } from "@/lib/actions/membership";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function RegenerateInviteButton({ membershipId }: { membershipId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    posthog.capture("invite_link_regenerated", { membership_id: membershipId });
    startTransition(async () => {
      try {
        await regenerateInviteLink({ membershipId });
        router.refresh();
      } catch {
        setError("Couldn't refresh invite link.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "Refreshing..." : "Refresh invite"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
