"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MobileHeaderActions({ userInitials }: { userInitials: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored === "dark" || (!stored && prefersDark));
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <button
        onClick={toggleDark}
        title={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted-foreground)",
          padding: 6,
          display: "flex",
          alignItems: "center",
          borderRadius: "var(--radius-md)",
        }}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
      <Link
        href="/perfil"
        title="Meu perfil"
        className="cpv-avatar"
        style={{
          width: 32,
          height: 32,
          fontSize: 12,
          background: "var(--azul-eletrico)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        {userInitials}
      </Link>
    </div>
  );
}
