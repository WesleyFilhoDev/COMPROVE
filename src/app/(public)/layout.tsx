"use client";

import { useEffect } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark", "theme-ready");
  }, []);

  return <>{children}</>;
}
