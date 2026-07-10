import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Moderation" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/reports", label: "Reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-12">
      <aside className="hidden w-48 flex-shrink-0 flex-col gap-1 sm:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
