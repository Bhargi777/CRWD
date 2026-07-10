import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Startups & Business", slug: "startups-business" },
  { name: "Investing & Finance", slug: "investing-finance" },
  { name: "Design", slug: "design" },
  { name: "Software Engineering", slug: "software-engineering" },
  { name: "Marketing & Growth", slug: "marketing-growth" },
  { name: "Writing", slug: "writing" },
  { name: "Fitness & Health", slug: "fitness-health" },
  { name: "Gaming", slug: "gaming" },
  { name: "Music & Audio", slug: "music-audio" },
  { name: "Personal Finance", slug: "personal-finance" },
];

const tags = [
  "beginner-friendly",
  "advanced",
  "1-on-1-access",
  "weekly-calls",
  "templates",
  "job-board",
  "accountability",
  "networking",
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: category,
    });
  }

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }

  console.log(`Seeded ${categories.length} categories and ${tags.length} tags.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
