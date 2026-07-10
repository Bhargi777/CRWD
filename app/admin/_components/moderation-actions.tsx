"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveCommunity, rejectCommunity } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ModerationActions({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      try {
        await approveCommunity(communityId);
        router.refresh();
      } catch {
        setError("Couldn't approve listing.");
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      try {
        await rejectCommunity({ communityId, reason });
        router.refresh();
      } catch {
        setError("Couldn't reject listing.");
      }
    });
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection"
          rows={2}
          className="w-64 rounded-md border border-border bg-card px-2 py-1 text-sm"
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending || !reason}>
            Confirm reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} disabled={isPending}>
          Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setShowReject(true)} disabled={isPending}>
          Reject
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
