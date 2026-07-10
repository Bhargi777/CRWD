"use client";

import { ErrorState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";

export default function CommunityError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <ErrorState
        description="We couldn't load this community right now."
        action={
          <Button variant="secondary" onClick={reset}>
            Retry
          </Button>
        }
      />
    </main>
  );
}
