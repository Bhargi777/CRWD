import { env } from "@/lib/env";

/**
 * Next.js's native instrumentation hook (not Sentry-specific config
 * wrapping) — keeps next.config.ts untouched. Source-map upload via
 * withSentryConfig can be added once a real SENTRY_DSN/org/project exist to
 * verify it against; this covers server + edge error capture only.
 */
export async function register() {
  if (!env.SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");

  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({ dsn: env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}
