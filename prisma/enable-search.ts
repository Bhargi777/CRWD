import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Enables Postgres trigram search (TECH_SPEC.md: "Postgres full-text/
 * trigram for exact/keyword match"). Run once after the initial
 * `prisma migrate dev` against a live database — Prisma's schema/migration
 * flow doesn't model extensions or non-btree index types, so this is applied
 * as a follow-up script rather than baked into schema.prisma.
 */
async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "communities_title_trgm_idx" ON "communities" USING GIN ("title" gin_trgm_ops);`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "communities_description_trgm_idx" ON "communities" USING GIN ("description" gin_trgm_ops);`,
  );
  console.log("Trigram search extension and indexes enabled.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
