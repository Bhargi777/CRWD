"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { onboardSeller } from "@/lib/actions/seller";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OnboardingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await onboardSeller({ displayName, bio: bio || undefined });
        router.refresh();
      } catch {
        setError("Couldn't set up your seller profile. Try again.");
      }
    });
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-1 text-xl font-semibold">Become a seller</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        List your community and start accepting members.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Display name
          </label>
          <input
            id="displayName"
            required
            minLength={2}
            maxLength={80}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Setting up..." : "Create seller profile"}
        </Button>
      </form>
    </Card>
  );
}
