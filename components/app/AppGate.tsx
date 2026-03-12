"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const ONBOARDED_KEY = "dagos_onboarded";
const SETUP_PATH = "/app/setup";

export function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Start as null (unknown) to avoid SSR flash — render nothing until we've
  // read localStorage on the client.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // /app/setup is always accessible
    if (pathname === SETUP_PATH) {
      setReady(true);
      return;
    }

    const onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    if (!onboarded) {
      router.replace(SETUP_PATH);
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) {
    // Render nothing while we check — avoids a layout flash before redirect
    return null;
  }

  return <>{children}</>;
}
