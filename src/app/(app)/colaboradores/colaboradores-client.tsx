"use client";

import { useState } from "react";
import Link from "next/link";
import { maskPhone, toE164 } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

type CollaboratorRow = {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  trainingsThisMonth: number;
  lastAccess: string | null;
};

type RawInvitation = {
  id: string;
  name: string;
  jobTitle: string;
  phone: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
  createdAt: string;
  invitedBy: { name: string };
};

type Props = {
  companyName: string;
  activeCollaborators: CollaboratorRow[];
  inactiveCollaborators: CollaboratorRow[];
  invitations: RawInvitation[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInvitationStatus(inv: {
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
}): InvitationStatus {
  if (inv.acceptedAt) return "accepted";
  if (inv.revokedAt) return "revoked";
  if (new Date(inv.expiresAt) < new Date()) return "expired";
  return "pending";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // E.164 without country code: 11 digits for BR mobile
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return phone;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PersonPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M1 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function InviteStatusBadge({ status }: { status: InvitationStatus }) {
  const config: Record<InvitationStatus, { bg: string; color: string; border: string; label: string }> = {
    pending: {
      bg: "var(--azul-gelo)",
      color: "var(--azul-eletrico)",
      border: "var(--azul-eletrico)",
      label: "Pendente",
    },
    accepted: {
      bg: "var(--success-soft)",
      color: "var(--success)",
      border: "var(--success-border)",
      label: "Aceito",
    },
    revoked: {
      bg: "var(--destructive-soft)",
      color: "var(--destructive)",
      border: "var(--destructive-border)",
      label: "Revogado",
    },
    expired: {
      bg: "var(--nevoa)",
      color: "var(--muted-foreground)",
      border: "var(--border)",
      label: "Expirado",
    },
  };
  const s = config[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

type ModalStep = "form" | "link";

function InviteModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: (waLink: string, inv: RawInvitation) => void;
}) {
  const [step, setStep] = useState<ModalStep>("form");
  const [fields, setFields] = useState({ name: "", phone: "", jobTitle: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdInv, setCreatedInv] = useState<RawInvitation | null>(null);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name,
        phone: toE164(fields.phone).replace(/^\+55/, ""),
        jobTitle: fields.jobTitle,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string | { formErrors?: string[] } };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao criar convite.");
      setError(msg);
      return;
    }

    const json = (await res.json()) as { waLink: string };
    setWaLink(json.waLink);

    // Refresh invitations to get the newly created one
    const listRes = await fetch("/api/invitations");
    if (listRes.ok) {
      const data = (await listRes.json()) as { invitations: RawInvitation[] };
      const newest = data.invitations[0] ?? null;
      setCreatedInv(newest);
      if (newest) onInvited(json.waLink, newest);
    }

    setStep("link");
  }

  function copyLink() {
    void navigator.clipboard.writeText(waLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(15,26,46,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl, 0 24px 48px rgba(15,26,46,0.18))",
          width: "100%",
          maxWidth: 480,
          padding: 32,
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            padding: 4,
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Fechar"
        >
          <XIcon />
        </button>

        {step === "form" && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 18,
                    color: "var(--tinta)",
                    margin: 0,
                  }}
                >
                  Convidar colaborador
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--azul-eletrico)",
                    background: "var(--azul-gelo)",
                    borderRadius: "var(--radius-full)",
                    padding: "3px 10px",
                  }}
                >
                  ETAPA 1 DE 2
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
                Ele recebe um link pelo WhatsApp para criar o próprio acesso.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Nome completo */}
              <div>
                <label
                  htmlFor="inv-name"
                  style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}
                >
                  Nome completo <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <input
                  id="inv-name"
                  type="text"
                  required
                  value={fields.name}
                  onChange={set("name")}
                  placeholder="Maria Silva"
                  style={{
                    width: "100%",
                    height: "var(--control-sm, 36px)",
                    padding: "0 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Telefone */}
              <div>
                <label
                  htmlFor="inv-phone"
                  style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}
                >
                  Telefone com DDD <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <input
                  id="inv-phone"
                  type="tel"
                  required
                  value={fields.phone}
                  onChange={(e) =>
                    setFields((p) => ({ ...p, phone: maskPhone(e.target.value) }))
                  }
                  placeholder="(11) 99999-9999"
                  style={{
                    width: "100%",
                    height: "var(--control-sm, 36px)",
                    padding: "0 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--azul-eletrico)" }}>
                  O convite vai para este número pelo WhatsApp.
                </p>
              </div>

              {/* Cargo */}
              <div>
                <label
                  htmlFor="inv-job"
                  style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}
                >
                  Cargo <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <input
                  id="inv-job"
                  type="text"
                  required
                  value={fields.jobTitle}
                  onChange={set("jobTitle")}
                  placeholder="Instrutor"
                  style={{
                    width: "100%",
                    height: "var(--control-sm, 36px)",
                    padding: "0 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--azul-eletrico)" }}>
                  Aparece no comprovante como cargo de quem ministrou.
                </p>
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--muted-foreground)",
                    padding: "0 16px",
                    height: "var(--control-sm, 36px)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="cpv-btn cpv-btn--primary"
                >
                  {pending ? "Gerando…" : "Gerar convite"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === "link" && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 18,
                    color: "var(--tinta)",
                    margin: 0,
                  }}
                >
                  Convidar colaborador
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "var(--success)",
                    background: "var(--success-soft)",
                    borderRadius: "var(--radius-full)",
                    padding: "3px 10px",
                  }}
                >
                  ETAPA 2 DE 2
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
                Convite criado para <strong>{createdInv?.name ?? fields.name}</strong>. Envie o link pelo WhatsApp.
              </p>
            </div>

            {/* Link box */}
            <div
              style={{
                background: "var(--success-soft)",
                border: "1px solid var(--success-border)",
                borderRadius: "var(--radius-lg)",
                padding: 16,
                marginBottom: 20,
              }}
            >
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--success)" }}>
                Link de convite (exibido apenas uma vez):
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--card)",
                  border: "1px solid var(--success-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                }}
              >
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: "var(--azul-eletrico)",
                    wordBreak: "break-all",
                    textDecoration: "none",
                    minWidth: 0,
                  }}
                >
                  {waLink}
                </a>
                <button
                  onClick={copyLink}
                  title="Copiar link"
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: copied ? "var(--success)" : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    padding: 4,
                  }}
                >
                  <CopyIcon />
                </button>
              </div>
              {copied && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--success)" }}>
                  Copiado!
                </p>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                className="cpv-btn cpv-btn--primary"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "ativos" | "convites" | "inativos";

export function ColaboradoresClient({
  companyName,
  activeCollaborators: initialActive,
  inactiveCollaborators,
  invitations: initialInvitations,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("ativos");
  const [showModal, setShowModal] = useState(false);
  const [invitations, setInvitations] = useState<RawInvitation[]>(initialInvitations);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const invRows = invitations.map((inv) => ({
    ...inv,
    status: getInvitationStatus(inv),
  }));

  const pendingInvites = invRows.filter((i) => i.status === "pending" || i.status === "expired");

  // Tab counts
  const activeCount = initialActive.length;
  const inviteCount = pendingInvites.length;
  const inactiveCount = inactiveCollaborators.length;

  // Filter active collaborators by search
  const filteredActive = initialActive.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.jobTitle ?? "").toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Filter invitations by search
  const filteredInvites = invRows.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.name.toLowerCase().includes(q) ||
      inv.jobTitle.toLowerCase().includes(q) ||
      inv.phone.includes(q)
    );
  });

  async function refreshInvitations() {
    const listRes = await fetch("/api/invitations");
    if (listRes.ok) {
      const data = (await listRes.json()) as { invitations: RawInvitation[] };
      setInvitations(data.invitations);
    }
  }

  async function handleResend(id: string) {
    setActionPending(id + ":resend");
    const res = await fetch(`/api/invitations/${id}/resend`, { method: "POST" });
    setActionPending(null);

    if (!res.ok) return;

    const json = (await res.json()) as { waLink: string };
    setWaLink(json.waLink);
    await refreshInvitations();
  }

  async function handleRevoke(id: string) {
    if (!confirm("Tem certeza que deseja revogar este convite?")) return;
    setActionPending(id + ":revoke");
    await fetch(`/api/invitations/${id}/revoke`, { method: "POST" });
    setActionPending(null);
    await refreshInvitations();
  }

  function handleInvited(link: string, inv: RawInvitation) {
    setInvitations((prev) => [inv, ...prev]);
    setWaLink(link);
  }

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "ativos", label: "Ativos", count: activeCount },
    { id: "convites", label: "Convites", count: inviteCount },
    { id: "inativos", label: "Inativos", count: inactiveCount },
  ];

  return (
    <div className="flex-1 min-h-screen" style={{ background: "var(--nevoa)" }}>
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}
          >
            {companyName}
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Colaboradores</span>
        </div>

        {/* Action */}
        <button
          className="cpv-btn cpv-btn--primary cpv-btn--sm"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <PersonPlusIcon />
          Convidar colaborador
        </button>
      </div>

      {/* Page body */}
      <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--tinta)",
              margin: "0 0 4px",
            }}
          >
            Colaboradores
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
            Quem registra treinamentos para a {companyName}
          </p>
        </div>

        {/* wa.me banner */}
        {waLink && (
          <div
            style={{
              background: "var(--success-soft)",
              border: "1px solid var(--success-border)",
              borderRadius: "var(--radius-lg)",
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
                Convite criado! Envie o link abaixo pelo WhatsApp:
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "var(--success)", wordBreak: "break-all", display: "block" }}
              >
                {waLink}
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted-foreground)" }}>
                Este link é exibido apenas uma vez.
              </p>
            </div>
            <button
              onClick={() => setWaLink(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--success)",
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
                padding: 0,
              }}
            >
              Fechar
            </button>
          </div>
        )}

        {/* Tabs row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            borderBottom: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "var(--azul-eletrico)" : "var(--muted-foreground)",
                borderBottom: activeTab === tab.id ? "2px solid var(--azul-eletrico)" : "2px solid transparent",
                marginBottom: -1,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.15s",
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: "var(--radius-full)",
                  padding: "2px 7px",
                  background: activeTab === tab.id ? "var(--azul-gelo)" : "var(--nevoa)",
                  color: activeTab === tab.id ? "var(--azul-eletrico)" : "var(--muted-foreground)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 20, maxWidth: 360 }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou telefone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "var(--control-sm, 36px)",
              padding: "0 12px 0 36px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tab: Ativos */}
        {activeTab === "ativos" && (
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {filteredActive.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
                {search ? "Nenhum resultado encontrado." : "Nenhum colaborador ativo ainda."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                    {["NOME", "TREINAMENTOS NO MÊS", "ÚLTIMO ACESSO", "SITUAÇÃO"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--muted-foreground)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                    <th style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredActive.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                            {getInitials(c.name)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.name}</div>
                            {c.jobTitle && (
                              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
                                {c.jobTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {c.trainingsThisMonth}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {c.lastAccess ? formatDate(c.lastAccess) : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--success)",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "var(--success)",
                              display: "inline-block",
                            }}
                          />
                          Ativo
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Convites */}
        {activeTab === "convites" && (
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {filteredInvites.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
                {search ? "Nenhum resultado encontrado." : "Nenhum convite enviado ainda."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                    {["NOME", "CARGO", "TELEFONE", "ENVIADO EM", "SITUAÇÃO", "AÇÕES"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--muted-foreground)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvites.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--foreground)" }}>
                        {inv.name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>
                        {inv.jobTitle}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {formatPhone(inv.phone)}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {formatDate(inv.createdAt)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <InviteStatusBadge status={inv.status} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {(inv.status === "pending" || inv.status === "expired") && (
                            <>
                              <button
                                onClick={() => handleResend(inv.id)}
                                disabled={actionPending === inv.id + ":resend"}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "var(--azul-eletrico)",
                                  padding: 0,
                                }}
                              >
                                {actionPending === inv.id + ":resend" ? "Reenviando…" : "Reenviar"}
                              </button>
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                disabled={actionPending === inv.id + ":revoke"}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "var(--destructive)",
                                  padding: 0,
                                }}
                              >
                                {actionPending === inv.id + ":revoke" ? "Revogando…" : "Revogar"}
                              </button>
                            </>
                          )}
                          {inv.status === "revoked" && (
                            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
                          )}
                          {inv.status === "accepted" && (
                            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Inativos */}
        {activeTab === "inativos" && (
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            {inactiveCollaborators.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
                Nenhum colaborador inativo.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                    {["NOME", "TREINAMENTOS NO MÊS", "ÚLTIMO ACESSO", "SITUAÇÃO"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--muted-foreground)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inactiveCollaborators.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", opacity: 0.65 }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            className="cpv-avatar"
                            style={{
                              width: 36,
                              height: 36,
                              fontSize: 13,
                              background: "var(--muted-foreground)",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(c.name)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{c.name}</div>
                            {c.jobTitle && (
                              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
                                {c.jobTitle}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {c.trainingsThisMonth}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                        {c.lastAccess ? formatDate(c.lastAccess) : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "var(--muted-foreground)",
                              display: "inline-block",
                            }}
                          />
                          Inativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <InviteModal
          onClose={() => setShowModal(false)}
          onInvited={(link, inv) => {
            handleInvited(link, inv);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
