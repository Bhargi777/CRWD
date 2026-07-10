"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let initialized = false;

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || initialized) return;
    initialized = true;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only",
    });
  }, []);

  return children;
}
