"use client";

import { ErrorState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";

export default function SearchError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <ErrorState
        description="Search failed. Please try again."
        action={
          <Button variant="secondary" onClick={reset}>
            Retry
          </Button>
        }
      />
    </main>
  );
}
