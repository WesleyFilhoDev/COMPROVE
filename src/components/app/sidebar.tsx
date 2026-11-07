"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";

type SidebarProps = {
  userName: string;
  userRole: string;
  companyName: string;
  companyInitials: string;
  userInitials: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PlusDocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 9.5h4M8 7.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 13c0-1.933-1.343-3.5-3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0L2.293 8.293A1 1 0 0 1 2 7.586V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11 3.05 3.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_SECTIONS = [
  {
    label: "GERAL",
    items: [
      { label: "Painel", href: "/dashboard", icon: <GridIcon /> },
      { label: "Novo treinamento", href: "/treinamentos", icon: <PlusDocIcon /> },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { label: "Colaboradores", href: "/colaboradores", icon: <PeopleIcon /> },
      { label: "Tipos de treinamento", href: "/tipos-de-treinamento", icon: <TagIcon /> },
      { label: "Relatórios", href: "/relatorios", icon: <BarChartIcon /> },
    ],
  },
];

export function Sidebar({ userName, userRole, companyName, companyInitials, userInitials }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [iconKey, setIconKey] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    // Enable color transitions only after initial theme is set
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    setIconKey((k) => k + 1);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleLogout() {
    await authClient.signOut();
    document.documentElement.classList.remove("dark", "theme-ready");
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: "100vh",
        background: "var(--sidebar)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--sidebar-border)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", textDecoration: "none" }}>
          <Logo size={28} tone="negative" variant="horizontal" />
        </Link>
      </div>

      {/* Company block */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          className="cpv-avatar"
          style={{
            width: 36,
            height: 36,
            fontSize: 13,
            background: "var(--azul-eletrico)",
            flexShrink: 0,
          }}
        >
          {companyInitials}
        </span>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "var(--font-display)",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {companyName}
          </div>
          <div style={{ color: "var(--sidebar-foreground)", fontSize: 11, lineHeight: 1.3 }}>
            Gestora da conta
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--sidebar-border)", margin: "4px 16px" }} />

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 4 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--sidebar-foreground)",
                opacity: 0.6,
                padding: "8px 8px 4px",
                textTransform: "uppercase",
              }}
            >
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "var(--sidebar-foreground)",
                    background: active ? "var(--azul-eletrico)" : "transparent",
                    transition: "background 0.1s, color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--sidebar-accent)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--sidebar-foreground)";
                    }
                  }}
                >
                  <span style={{ opacity: active ? 1 : 0.75, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <div style={{ padding: "4px 8px 8px" }}>
        <button
          onClick={toggleDark}
          title={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 8px",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            color: "var(--sidebar-foreground)",
            fontSize: 13,
            fontWeight: 400,
            cursor: "pointer",
            transition: "background 0.1s, color 0.1s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--sidebar-accent)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--sidebar-foreground)";
          }}
        >
          <span key={iconKey} className="theme-icon-enter" style={{ opacity: 0.75, flexShrink: 0, display: "flex" }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </span>
          {dark ? "Modo claro" : "Modo escuro"}
        </button>
      </div>

      {/* Bottom user block */}
      <div style={{ borderTop: "1px solid var(--sidebar-border)", padding: "12px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/perfil"
            title="Meu perfil"
            className="cpv-avatar"
            style={{
              width: 32,
              height: 32,
              fontSize: 12,
              background: "var(--marinho)",
              border: "1px solid var(--sidebar-border)",
              flexShrink: 0,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            {userInitials}
          </Link>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </div>
            <div style={{ color: "var(--sidebar-foreground)", fontSize: 11 }}>{userRole}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--sidebar-foreground)",
              padding: 4,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "var(--sidebar-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--sidebar-foreground)";
              e.currentTarget.style.background = "none";
            }}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
