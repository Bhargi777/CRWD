import { LoadingState } from "@/components/ui/state";

export default function CommunityLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <LoadingState />
    </main>
  );
}
