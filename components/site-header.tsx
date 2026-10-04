import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="text-base font-semibold tracking-tight">
        CRWD
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/browse" className="text-muted-foreground hover:text-foreground">
          Browse
        </Link>
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
  );
}
