import { listCategories, listTags } from "@/lib/taxonomy";
import { ListingForm } from "@/app/sell/_components/listing-form";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">New listing</h1>
      <ListingForm categories={categories} tags={tags} />
    </div>
  );
}
