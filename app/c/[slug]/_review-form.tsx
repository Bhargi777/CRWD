"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function ReviewForm({
  communityId,
  existingRating,
  existingBody,
}: {
  communityId: string;
  existingRating?: number;
  existingBody?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(existingRating ?? 5);
  const [body, setBody] = useState(existingBody ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await submitReview({ communityId, rating, body: body || undefined });
        posthog.capture("review_submitted", {
          community_id: communityId,
          rating,
          is_update: !!existingRating,
          has_body: !!body,
        });
        router.refresh();
      } catch {
        setError("Couldn't submit your review.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
            className={value <= rating ? "text-warning" : "text-border"}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Share your experience (optional)"
        className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : existingRating ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}
