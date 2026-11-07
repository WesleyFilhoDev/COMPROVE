"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/generated/prisma/client";

const COOLDOWN_DAYS = 30;

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    nameChangedAt: string | null;
    role: UserRole | null;
  };
  company: {
    id: string;
    name: string;
    nameChangedAt: string | null;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntilAllowed(changedAt: string | null): number | null {
  if (!changedAt) return null;
  const next = new Date(changedAt);
  next.setDate(next.getDate() + COOLDOWN_DAYS);
  const diff = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M11.5 1.5a1.42 1.42 0 0 1 2 2l-9 9-2.5.5.5-2.5 9-9Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1.2" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.9 5.2 2 6.5 2 8c0 2.5 2.7 5 6 5a7.6 7.6 0 0 0 3.8-1.1M6.5 3.1C7 3 7.5 3 8 3c3.3 0 6 2.5 6 5 0 .8-.3 1.6-.7 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8" rx="6" ry="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "var(--azul-eletrico)" }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--tinta)", fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}

// ─── Inline editable field ────────────────────────────────────────────────────

function EditableField({
  label,
  value: initialValue,
  onSave,
  cooldownDays,
  disabled,
}: {
  label: string;
  value: string;
  onSave: (val: string) => Promise<string | null>;
  cooldownDays: number | null;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [current, setCurrent] = useState(initialValue);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (value.trim() === current) { setEditing(false); return; }
    setError(null);
    setPending(true);
    const err = await onSave(value.trim());
    setPending(false);
    if (err) {
      setError(err);
    } else {
      setCurrent(value.trim());
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const isLocked = cooldownDays !== null;

  return (
    <div style={{ marginBottom: 0 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </label>

      {editing ? (
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") void handleSave(); if (e.key === "Escape") { setValue(current); setEditing(false); } }}
              style={{
                flex: 1,
                height: 36,
                padding: "0 12px",
                border: "1px solid var(--azul-eletrico)",
                borderRadius: "var(--radius-md)",
                fontSize: 14,
                outline: "none",
                background: "var(--card)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={handleSave}
              disabled={pending || !value.trim()}
              className="cpv-btn cpv-btn--primary cpv-btn--sm"
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
            <button
              onClick={() => { setValue(current); setEditing(false); setError(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted-foreground)", padding: "0 8px", height: 36 }}
            >
              Cancelar
            </button>
          </div>
          {error && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--destructive)" }}>{error}</p>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)" }}>{current}</span>
          {success && (
            <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>✓ Salvo</span>
          )}
          {!disabled && (
            isLocked ? (
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Disponível em {cooldownDays} dia{cooldownDays !== 1 ? "s" : ""}
              </span>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "2px 6px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <PencilIcon /> Editar
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Password section ─────────────────────────────────────────────────────────

function PasswordSection() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function getStrength(pwd: string): { level: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
    if (!pwd) return { level: 0, label: "", color: "" };
    if (pwd.length < 8) return { level: 1, label: "Muito fraca", color: "var(--destructive)" };
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    if (!hasLetter || !hasNumber) return { level: 2, label: "Fraca", color: "var(--warning, #f59e0b)" };
    if (!hasSpecial) return { level: 3, label: "Boa", color: "var(--warning, #f59e0b)" };
    return { level: 4, label: "Forte", color: "var(--success)" };
  }

  const strength = getStrength(newPw);
  const passwordsMatch = !confirmPw || newPw === confirmPw;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setError("As senhas não coincidem."); return; }
    if (newPw.length < 8) { setError("A nova senha precisa ter ao menos 8 caracteres."); return; }
    setError(null);
    setPending(true);

    const result = await authClient.changePassword({
      currentPassword: currentPw,
      newPassword: newPw,
      revokeOtherSessions: false,
    });

    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Erro ao alterar senha.");
      return;
    }

    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 36px 0 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    fontSize: 14,
    outline: "none",
    background: "var(--card)",
    color: "var(--foreground)",
    boxSizing: "border-box",
  };

  function PwField({ id, label, value, onChange, show, onToggle }: {
    id: string; label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
  }) {
    return (
      <div>
        <label htmlFor={id} style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
          {label}
        </label>
        <div style={{ position: "relative" }}>
          <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} autoComplete="off" />
          <button type="button" onClick={onToggle} tabIndex={-1} aria-label={show ? "Ocultar" : "Mostrar"}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center" }}>
            <EyeIcon open={show} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PwField id="current-pw" label="Senha atual" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />

      <div>
        <PwField id="new-pw" label="Nova senha" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} />
        {newPw && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength.level ? strength.color : "var(--border)", transition: "background 0.2s" }} />
              ))}
            </div>
            <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirm-pw" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
          Confirmar nova senha
        </label>
        <input
          id="confirm-pw"
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          style={{ ...inputStyle, borderColor: !passwordsMatch ? "var(--destructive)" : "var(--border)", padding: "0 12px" }}
          autoComplete="off"
        />
        {!passwordsMatch && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--destructive)" }}>As senhas não coincidem</p>}
      </div>

      {error && <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: "var(--success)", fontWeight: 600 }}>✓ Senha alterada com sucesso.</p>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <button type="submit" disabled={pending || !currentPw || !newPw || !confirmPw} className="cpv-btn cpv-btn--primary">
          {pending ? "Salvando…" : "Alterar senha"}
        </button>
        <Link href="/esqueci-senha" style={{ fontSize: 13, color: "var(--azul-eletrico)", fontWeight: 500 }}>
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PerfilClient({ user, company }: Props) {
  const [userName, setUserName] = useState(user.name);
  const [companyName, setCompanyName] = useState(company.name);
  const [userCooldown, setUserCooldown] = useState(() => daysUntilAllowed(user.nameChangedAt));
  const [companyCooldown, setCompanyCooldown] = useState(() => daysUntilAllowed(company.nameChangedAt));

  async function saveUserName(name: string): Promise<string | null> {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: { nameChangedAt: string } };
      setUserName(name);
      setUserCooldown(daysUntilAllowed(data.user.nameChangedAt));
      return null;
    }
    const data = (await res.json()) as { error: string };
    return data.error ?? "Erro ao salvar.";
  }

  async function saveCompanyName(name: string): Promise<string | null> {
    const res = await fetch("/api/profile/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = (await res.json()) as { company: { nameChangedAt: string } };
      setCompanyName(name);
      setCompanyCooldown(daysUntilAllowed(data.company.nameChangedAt));
      return null;
    }
    const data = (await res.json()) as { error: string };
    return data.error ?? "Erro ao salvar.";
  }

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
          gap: 6,
          fontSize: 13,
        }}
      >
        <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>
          {companyName}
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Meu perfil</span>
      </div>

      {/* Page body */}
      <div style={{ padding: "28px 32px", maxWidth: 680 }}>
        {/* Avatar + heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <span
            className="cpv-avatar"
            style={{ width: 56, height: 56, fontSize: 20, background: "var(--azul-eletrico)", flexShrink: 0 }}
          >
            {getInitials(userName)}
          </span>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--tinta)", margin: "0 0 2px" }}>
              {userName}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
              {user.email} · {user.role === "ADMIN" ? "Gestor da conta" : "Instrutor"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Meus dados */}
          <SectionCard title="Meus dados" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <EditableField
                label="Nome"
                value={userName}
                onSave={saveUserName}
                cooldownDays={userCooldown}
              />
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                  E-mail
                </label>
                <span style={{ fontSize: 15, color: "var(--foreground)" }}>{user.email}</span>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>
                  O e-mail não pode ser alterado.
                </p>
              </div>
              {userCooldown !== null && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", background: "var(--nevoa)", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                  Próxima alteração de nome disponível em <strong>{userCooldown} dia{userCooldown !== 1 ? "s" : ""}</strong>.
                </p>
              )}
            </div>
          </SectionCard>

          {/* Empresa — só para ADMIN */}
          {user.role === "ADMIN" && (
            <SectionCard title="Empresa" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <EditableField
                  label="Nome da empresa"
                  value={companyName}
                  onSave={saveCompanyName}
                  cooldownDays={companyCooldown}
                />
                {companyCooldown !== null && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)", background: "var(--nevoa)", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    Próxima alteração do nome da empresa disponível em <strong>{companyCooldown} dia{companyCooldown !== 1 ? "s" : ""}</strong>.
                  </p>
                )}
              </div>
            </SectionCard>
          )}

          {/* Senha */}
          <SectionCard title="Senha" icon={<LockIcon />}>
            <PasswordSection />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
