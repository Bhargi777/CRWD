import { LoadingState } from "@/components/ui/state";

export default function BrowseLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingState key={i} />
        ))}
      </div>
    </main>
  );
}
