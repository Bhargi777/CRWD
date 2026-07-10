import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Discover paid communities
      </h1>
      <p className="max-w-xl text-base text-muted-foreground">
        CRWD is the discovery and payment layer for paid communities. Browse
        by topic, join in a few clicks, and get instant access.
      </p>
      <div className="flex gap-3">
        <Link
          href="/browse"
          className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          Browse communities
        </Link>
        <Link
          href="/sell"
          className="rounded-md border border-border px-5 py-3 text-sm font-medium"
        >
          List your community
        </Link>
      </div>
    </main>
  );
}
