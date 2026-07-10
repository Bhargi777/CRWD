import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAppUser } from "@/lib/auth";
import { listCategories, listTags } from "@/lib/taxonomy";
import { ListingForm } from "@/app/sell/_components/listing-form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAppUser();

  const [community, categories, tags] = await Promise.all([
    prisma.community.findUnique({
      where: { id },
      include: { seller: true, tags: { include: { tag: true } } },
    }),
    listCategories(),
    listTags(),
  ]);

  if (!community || community.seller.userId !== user.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Edit listing</h1>
      <ListingForm categories={categories} tags={tags} existing={community} />
    </div>
  );
}
