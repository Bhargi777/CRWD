"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCommunity, updateCommunity, submitForReview } from "@/lib/actions/community";
import { requestCoverImageUpload } from "@/lib/actions/upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type ExistingCommunity = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priceCents: number;
  currency: string;
  billingInterval: "one_time" | "monthly" | "yearly";
  platform: "discord" | "slack" | "telegram" | "other";
  coverImageUrl: string | null;
  status: string;
  tags: { tag: { id: string } }[];
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function ListingForm({
  categories,
  tags,
  existing,
}: {
  categories: Category[];
  tags: Tag[];
  existing?: ExistingCommunity;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(existing?.tags.map((t) => t.tag.id) ?? []);
  const [price, setPrice] = useState(existing ? existing.priceCents / 100 : 0);
  const [billingInterval, setBillingInterval] = useState<"one_time" | "monthly" | "yearly">(
    existing?.billingInterval ?? "one_time",
  );
  const [platform, setPlatform] = useState<"discord" | "slack" | "telegram" | "other">(
    existing?.platform ?? "discord",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.coverImageUrl ?? "");

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setError("Cover image must be PNG, JPEG, or WebP.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const { uploadUrl, publicUrl } = await requestCoverImageUpload({
        contentType: file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
      });
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setCoverImageUrl(publicUrl);
    } catch {
      setError("Cover image upload failed. Configure GCS credentials and retry.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: { preventDefault: () => void }, thenSubmitForReview = false) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const payload = {
          title,
          description,
          categoryId,
          tagIds,
          priceCents: Math.round(price * 100),
          currency: "USD",
          billingInterval,
          platform,
          coverImageUrl: coverImageUrl || undefined,
        };

        const community = existing
          ? await updateCommunity(existing.id, payload)
          : await createCommunity(payload);

        if (thenSubmitForReview) {
          await submitForReview(community.id);
        }

        router.push("/sell");
        router.refresh();
      } catch {
        setError("Couldn't save listing. Check required fields and try again.");
      }
    });
  }

  return (
    <Card>
      <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            required
            minLength={4}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            required
            minLength={20}
            maxLength={5000}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="platform" className="mb-1 block text-sm font-medium">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as typeof platform)}
              className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="discord">Discord</option>
              <option value="slack">Slack</option>
              <option value="telegram">Telegram</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step={0.01}
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="billingInterval" className="mb-1 block text-sm font-medium">
              Billing
            </label>
            <select
              id="billingInterval"
              value={billingInterval}
              onChange={(e) => setBillingInterval(e.target.value as typeof billingInterval)}
              className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm"
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Tags</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={
                  tagIds.includes(tag.id)
                    ? "rounded-sm bg-primary/10 px-2 py-1 text-xs text-primary"
                    : "rounded-sm bg-surface px-2 py-1 text-xs text-muted-foreground"
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="cover" className="mb-1 block text-sm font-medium">
            Cover image
          </label>
          <input id="cover" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          {uploading ? <p className="mt-1 text-xs text-muted-foreground">Uploading...</p> : null}
          {coverImageUrl ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{coverImageUrl}</p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-3">
          <Button type="submit" variant="secondary" disabled={isPending}>
            Save draft
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isPending}>
            {isPending ? "Saving..." : "Save & submit for review"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
