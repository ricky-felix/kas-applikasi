"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import type { Account } from "@/lib/data";

export function PostHogIdentify({ user }: { user: Account }) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;
    posthog.identify(user.name, {
      role: user.role,
      short: user.short,
      ...(user.workerId ? { workerId: user.workerId } : {}),
    });
  }, [posthog, user.name, user.role, user.short, user.workerId]);

  return null;
}
