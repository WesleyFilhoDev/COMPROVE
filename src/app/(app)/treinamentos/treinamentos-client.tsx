"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { maskCpf } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainingStatus = "ISSUED" | "CANCELED";

type SignatureRow = {
  signerRole: string;
  status: string;
  signedAt: string | null;
};

type TrainingRow = {
  id: string;
  status: TrainingStatus;
  startsAt: string;
  endsAt: string;
  traineeName: string;
  traineeCpf: string;
  clientCompanyName: string;
  verificationCode: string;
  canceledAt: string | null;
  cancelReason: string | null;
  instructor: { id: string; name: string; jobTitle: string | null };
  trainingType: { id: string; name: string };
  signatures: SignatureRow[];
};

type TrainingType = { id: string; name: string };
type Collaborator = { id: string; name: string; jobTitle: string | null };

type Props = {
  companyName: string;
  initialTrainings: TrainingRow[];
  trainingTypes: TrainingType[];
  collaborators: Collaborator[];
  isAdmin: boolean;
};

const EMPTY_FORM = {
  trainingTypeId: "",
  instructorId: "",
  startsAt: "",
  endsAt: "",
  traineeName: "",
  traineeCpf: "",
  clientCompanyName: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const startDate = fmt(startsAt);
  const endDate = fmt(endsAt);
  if (startDate === endDate) return `${startDate} ${fmtTime(startsAt)}–${fmtTime(endsAt)}`;
  return `${startDate} – ${endDate}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TrainingStatus }) {
  if (status === "ISSUED") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
        style={{ background: "var(--success-soft)", color: "var(--success)", borderColor: "var(--success-border)" }}
      >
        Emitido
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{ background: "var(--destructive-soft)", color: "var(--destructive)", borderColor: "var(--destructive-border)" }}
    >
      Cancelado
    </span>
  );
}

// ─── New Training Panel ───────────────────────────────────────────────────────

function NewTrainingPanel({
  trainingTypes,
  collaborators,
  onClose,
  onCreated,
}: {
  trainingTypes: TrainingType[];
  collaborators: Collaborator[];
  onClose: () => void;
  onCreated: (t: TrainingRow) => void;
}) {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80);
  }, []);

  function set(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, traineeCpf: fields.traineeCpf.replace(/\D/g, "") }),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as {
        error: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
      };
      let msg = "Erro ao emitir treinamento.";
      if (typeof json.error === "string") {
        msg = json.error;
      } else if (json.error?.formErrors?.[0]) {
        msg = json.error.formErrors[0];
      } else if (json.error?.fieldErrors) {
        const first = Object.values(json.error.fieldErrors).flat()[0];
        if (first) msg = first;
      }
      setError(msg);
      return;
    }

    const json = (await res.json()) as { training: TrainingRow };
    onCreated(json.training);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 36,
    padding: "0 12px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    background: "var(--card)",
    color: "var(--foreground)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 6,
  };

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(15,26,46,0.3)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "100%",
          maxWidth: 520,
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-8px 0 32px rgba(15,26,46,0.12)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 17,
              color: "var(--tinta)",
              margin: 0,
            }}
          >
            Novo treinamento
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              padding: 6,
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}
        >
          {/* Tipo de treinamento */}
          <div>
            <label htmlFor="tt-type" style={labelStyle}>
              Tipo de treinamento <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <select
              id="tt-type"
              ref={firstRef}
              required
              value={fields.trainingTypeId}
              onChange={set("trainingTypeId")}
              style={inputStyle}
            >
              <option value="">Selecione…</option>
              {trainingTypes.map((tt) => (
                <option key={tt.id} value={tt.id}>{tt.name}</option>
              ))}
            </select>
          </div>

          {/* Instrutor */}
          <div>
            <label htmlFor="tt-instructor" style={labelStyle}>
              Instrutor <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <select
              id="tt-instructor"
              required
              value={fields.instructorId}
              onChange={set("instructorId")}
              style={inputStyle}
            >
              <option value="">Selecione…</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.jobTitle ? ` — ${c.jobTitle}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="tt-starts" style={labelStyle}>
                Início <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="tt-starts"
                type="datetime-local"
                required
                value={fields.startsAt}
                onChange={set("startsAt")}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="tt-ends" style={labelStyle}>
                Término <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="tt-ends"
                type="datetime-local"
                required
                value={fields.endsAt}
                onChange={set("endsAt")}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Treinando */}
          <div>
            <label htmlFor="tt-trainee-name" style={labelStyle}>
              Nome do treinando <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              id="tt-trainee-name"
              type="text"
              required
              value={fields.traineeName}
              onChange={set("traineeName")}
              placeholder="João da Silva"
              style={inputStyle}
            />
          </div>

          {/* CPF */}
          <div>
            <label htmlFor="tt-cpf" style={labelStyle}>
              CPF do treinando <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              id="tt-cpf"
              type="text"
              required
              value={fields.traineeCpf}
              onChange={(e) =>
                setFields((p) => ({ ...p, traineeCpf: maskCpf(e.target.value) }))
              }
              placeholder="000.000.000-00"
              maxLength={14}
              style={inputStyle}
            />
          </div>

          {/* Empresa cliente */}
          <div>
            <label htmlFor="tt-client" style={labelStyle}>
              Empresa cliente <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              id="tt-client"
              type="text"
              required
              value={fields.clientCompanyName}
              onChange={set("clientCompanyName")}
              placeholder="Nome da empresa contratante"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>
          )}

          <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 10 }}>
            <button
              type="submit"
              disabled={pending}
              className="cpv-btn cpv-btn--primary"
              style={{ flex: 1 }}
            >
              {pending ? "Emitindo…" : "Emitir treinamento"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flexShrink: 0,
                height: 40,
                padding: "0 14px",
                border: "none",
                borderRadius: "var(--radius-md)",
                background: "none",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  onClose,
  onConfirm,
  pending,
  error,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [reason, setReason] = useState("");

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl, 0 24px 48px rgba(15,26,46,0.18))",
          width: "100%",
          maxWidth: 440,
          padding: 28,
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--tinta)", margin: "0 0 6px" }}>
          Cancelar treinamento
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted-foreground)" }}>
          Esta ação é irreversível. Informe o motivo do cancelamento.
        </p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Descreva o motivo com ao menos 10 caracteres…"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            background: "var(--card)",
            color: "var(--foreground)",
            fontSize: 14,
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.5,
          }}
        />
        {error && (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--destructive)" }}>{error}</p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--muted-foreground)",
              padding: "0 12px",
              height: 36,
              borderRadius: "var(--radius-md)",
            }}
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={pending || reason.length < 10}
            onClick={() => onConfirm(reason)}
            style={{
              height: 36,
              padding: "0 16px",
              border: "none",
              borderRadius: "var(--radius-md)",
              background: "var(--destructive)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: reason.length < 10 ? "not-allowed" : "pointer",
              opacity: reason.length < 10 ? 0.5 : 1,
            }}
          >
            {pending ? "Cancelando…" : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sign Link Panel ─────────────────────────────────────────────────────────

function SignLinkPanel({
  traineeName,
  trainingType,
  signUrl,
  isSigned,
  signedAt,
  loading,
  onClose,
}: {
  traineeName: string;
  trainingType: string;
  signUrl: string;
  isSigned: boolean;
  signedAt: string | null;
  loading: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    void navigator.clipboard.writeText(signUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const waLink = `https://wa.me/?text=${encodeURIComponent(
    `Olá ${traineeName}! Para confirmar sua participação no treinamento ${trainingType}, acesse o link abaixo e assine digitalmente:\n${signUrl}`,
  )}`;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(15,26,46,0.3)" }} onClick={onClose} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: "100%", maxWidth: 440,
        background: "var(--card)", borderLeft: "1px solid var(--border)",
        boxShadow: "-8px 0 32px rgba(15,26,46,0.12)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--tinta)", margin: "0 0 3px" }}>
              Link de assinatura
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
              {traineeName} · {trainingType}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6 }}>
            <XIcon />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted-foreground)", fontSize: 13 }}>
              Carregando link…
            </div>
          )}

          {!loading && (
            <>
              {isSigned ? (
                <div style={{ background: "var(--success-soft)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-lg)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✓</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--success)" }}>Treinamento já assinado</p>
                    {signedAt && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--success)" }}>
                        em {new Date(signedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--warning-soft)", border: "1px solid var(--warning-border)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>Aguardando assinatura do treinando</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--warning)" }}>Envie o link abaixo para {traineeName}.</p>
                </div>
              )}

              {/* Link box */}
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Link de assinatura</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
                  <span style={{ flex: 1, fontSize: 12, color: "var(--azul-eletrico)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>{signUrl || "—"}</span>
                  <button onClick={copyLink} title="Copiar link" style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: copied ? "var(--success)" : "var(--muted-foreground)", padding: 4, display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
                {copied && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--success)" }}>Link copiado!</p>}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={copyLink} className="cpv-btn cpv-btn--primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {copied ? "Copiado!" : "Copiar link"}
                </button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="cpv-btn cpv-btn--outline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5A6.9 6.9 0 0 0 8 0C3.58 0 0 3.58 0 8c0 1.41.37 2.75 1.01 3.91L0 16l4.19-1.1A7.93 7.93 0 0 0 8 16c4.42 0 8-3.58 8-8 0-2.14-.83-4.14-2.5-5.5ZM8 14.5a6.4 6.4 0 0 1-3.27-.9l-.23-.14-2.49.65.67-2.42-.16-.25A6.46 6.46 0 0 1 1.5 8c0-3.59 2.91-6.5 6.5-6.5S14.5 4.41 14.5 8 11.59 14.5 8 14.5Zm3.56-4.87c-.19-.1-1.14-.56-1.32-.63-.17-.06-.3-.1-.42.1-.13.19-.49.63-.6.75-.11.13-.22.14-.41.05-.19-.1-.8-.3-1.52-.95-.56-.5-.94-1.12-1.05-1.31-.11-.19-.01-.29.08-.38.09-.09.19-.23.29-.34.1-.12.13-.19.19-.32.07-.13.03-.24-.01-.34-.05-.1-.42-1.01-.58-1.38-.15-.36-.3-.31-.42-.32h-.36c-.12 0-.32.04-.49.24-.17.19-.64.63-.64 1.53s.66 1.77.75 1.9c.1.12 1.3 1.98 3.15 2.78.44.19.78.3 1.05.38.44.14.84.12 1.16.07.35-.05 1.09-.45 1.24-.88.15-.43.15-.8.1-.88-.04-.08-.17-.13-.36-.22Z" fill="currentColor"/></svg>
                  Enviar pelo WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TreinamentosClient({
  companyName,
  initialTrainings,
  trainingTypes,
  collaborators,
  isAdmin,
}: Props) {
  const [trainings, setTrainings] = useState<TrainingRow[]>(initialTrainings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrainingStatus | "">("");
  const [showPanel, setShowPanel] = useState(false);
  const [signLinkTraining, setSignLinkTraining] = useState<TrainingRow | null>(null);
  const [signLinkToken, setSignLinkToken] = useState<string | null>(null);
  const [signLinkLoading, setSignLinkLoading] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = trainings;
    if (filterStatus) list = list.filter((t) => t.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.traineeName.toLowerCase().includes(q) ||
          t.trainingType.name.toLowerCase().includes(q) ||
          t.instructor.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [trainings, search, filterStatus]);

  async function openSignLink(t: TrainingRow) {
    setSignLinkTraining(t);
    setSignLinkToken(null);
    setSignLinkLoading(true);
    const res = await fetch(`/api/trainings/${t.id}/sign-token`);
    setSignLinkLoading(false);
    if (res.ok) {
      const data = (await res.json()) as { signToken: string };
      setSignLinkToken(data.signToken);
    }
  }

  function handleCreated(t: TrainingRow) {
    setTrainings((prev) => [t, ...prev]);
    setShowPanel(false);
  }

  async function handleCancel(reason: string) {
    if (!cancelId) return;
    setCancelError(null);
    setCancelPending(true);

    const res = await fetch(`/api/trainings/${cancelId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    setCancelPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string };
      setCancelError(json.error ?? "Erro ao cancelar.");
      return;
    }

    const json = (await res.json()) as { training: TrainingRow };
    setTrainings((prev) => prev.map((t) => (t.id === cancelId ? json.training : t)));
    setCancelId(null);
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
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link href="/dashboard" style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}>
            {companyName}
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Treinamentos</span>
        </div>
        <button
          className="cpv-btn cpv-btn--primary cpv-btn--sm"
          onClick={() => setShowPanel(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <PlusIcon />
          Novo treinamento
        </button>
      </div>

      {/* Page body */}
      <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--tinta)", margin: "0 0 4px" }}>
            Treinamentos
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
            Emita e gerencie os comprovantes de treinamento.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", maxWidth: 320 }}>
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
              placeholder="Buscar por nome, tipo, instrutor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: 320,
                height: 36,
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TrainingStatus | "")}
            style={{
              height: 36,
              padding: "0 36px 0 12px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">Todos os status</option>
            <option value="ISSUED">Emitido</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>
              {trainings.length === 0 ? (
                <div>
                  <p style={{ margin: "0 0 16px" }}>Nenhum treinamento emitido ainda.</p>
                  <button
                    className="cpv-btn cpv-btn--primary cpv-btn--sm"
                    onClick={() => setShowPanel(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon />
                    Emitir primeiro treinamento
                  </button>
                </div>
              ) : (
                "Nenhum treinamento encontrado com esses filtros."
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--nevoa)" }}>
                  {["TREINANDO", "TIPO", "INSTRUTOR", "PERÍODO", "STATUS", ""].map((col, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--muted-foreground)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                        ...(i === 5 ? { width: 120 } : {}),
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      opacity: t.status === "CANCELED" ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{t.traineeName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                        {maskCpf(t.traineeCpf)}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>
                      {t.trainingType.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted-foreground)" }}>
                      {t.instructor.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {formatDateRange(t.startsAt, t.endsAt)}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <a
                          href={`/verificar/${t.verificationCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: "var(--azul-eletrico)", textDecoration: "none" }}
                        >
                          Ver
                        </a>
                        <a
                          href={`/api/trainings/${t.id}/pdf`}
                          download
                          style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textDecoration: "none" }}
                        >
                          PDF
                        </a>
                        {t.status === "ISSUED" && (() => {
                          const traineeSig = t.signatures.find((s) => s.signerRole === "TRAINEE");
                          const isSigned = traineeSig?.status === "SIGNED";
                          return (
                            <button
                              onClick={() => openSignLink(t)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                                color: isSigned ? "var(--success)" : "var(--azul-eletrico)",
                                padding: 0,
                              }}
                            >
                              {isSigned ? "✓ Assinado" : "Enviar link"}
                            </button>
                          );
                        })()}
                        {isAdmin && t.status === "ISSUED" && (
                          <button
                            onClick={() => { setCancelId(t.id); setCancelError(null); }}
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
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New training panel */}
      {showPanel && (
        <NewTrainingPanel
          trainingTypes={trainingTypes}
          collaborators={collaborators}
          onClose={() => setShowPanel(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Sign link panel */}
      {signLinkTraining && (() => {
        const traineeSig = signLinkTraining.signatures.find((s) => s.signerRole === "TRAINEE");
        const signUrl = signLinkToken
          ? `${typeof window !== "undefined" ? window.location.origin : ""}/assinar/${signLinkToken}`
          : "";
        const isSigned = traineeSig?.status === "SIGNED";
        return (
          <SignLinkPanel
            traineeName={signLinkTraining.traineeName}
            trainingType={signLinkTraining.trainingType.name}
            signUrl={signUrl}
            isSigned={isSigned}
            signedAt={traineeSig?.signedAt ?? null}
            loading={signLinkLoading}
            onClose={() => { setSignLinkTraining(null); setSignLinkToken(null); }}
          />
        );
      })()}

      {/* Cancel modal */}
      {cancelId && (
        <CancelModal
          onClose={() => setCancelId(null)}
          onConfirm={handleCancel}
          pending={cancelPending}
          error={cancelError}
        />
      )}
    </div>
  );
}
