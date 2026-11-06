"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <Link href="/cadastro" className="cpv-btn cpv-btn--secondary cpv-btn--sm">
        Criar conta
      </Link>
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "1px solid var(--sidebar-border)",
          borderRadius: "var(--radius-md)",
          color: "#FFFFFF",
          cursor: "pointer",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          aria-label="Principal"
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: "calc(100vw - 48px)",
            maxWidth: 320,
            padding: 8,
            background: "var(--sidebar-accent)",
            border: "1px solid var(--sidebar-border)",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            flexDirection: "column",
            zIndex: 50,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {[
            ["#problema", "O problema"],
            ["#como-funciona", "Como funciona"],
            ["#relatorios", "Relatórios"],
            ["#verificacao", "Verificação"],
            ["#perguntas", "Perguntas"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="lp-navlink lp-navlink--dark"
              style={{ padding: "12px", fontSize: 16 }}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            className="lp-navlink lp-navlink--dark"
            style={{ padding: "12px", fontSize: 16 }}
            onClick={() => setOpen(false)}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="cpv-btn cpv-btn--secondary"
            style={{ marginTop: 8, justifyContent: "center" }}
            onClick={() => setOpen(false)}
          >
            Criar conta
          </Link>
        </nav>
      )}
    </div>
  );
}
