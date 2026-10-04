import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRWD — Discover paid communities",
  description:
    "Browse, join, and manage paid communities. CRWD handles discovery, payment, and membership so creators can focus on their community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider>
          <PostHogProvider>
            <SiteHeader />
            {children}
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
