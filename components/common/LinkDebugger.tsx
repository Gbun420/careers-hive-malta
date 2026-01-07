"use client";

import { useEffect } from "react";

export function LinkDebugger() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_LINKS !== "1") return;

    console.log("🛠️ Link Debugger active (NEXT_PUBLIC_DEBUG_LINKS=1)");

    // 1. Patch window.open
    const originalOpen = window.open;
    window.open = function(url?: string | URL, target?: string, features?: string) {
      if (!url || (typeof url === "string" && !url.trim())) {
        console.warn("🚫 window.open blocked: URL is falsy/empty");
        console.trace();
        return null;
      }
      return originalOpen.call(window, url, target, features);
    };

    // 2. Capture document clicks for empty anchors
    const handleClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== "A") {
        target = target.parentElement;
      }

      if (target && target.tagName === "A") {
        const href = target.getAttribute("href");
        if (!href || !href.trim()) {
          console.warn("🚫 Empty anchor clicked:", target);
          console.trace();
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      window.open = originalOpen;
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
