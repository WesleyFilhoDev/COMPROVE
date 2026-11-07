"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  clientCompanyName: "",
};

type TraineeRow = { name: string; cpf: string };

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
  onCreated: (trainings: TrainingRow[]) => void;
}) {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [trainees, setTrainees] = useState<TraineeRow[]>([{ name: "", cpf: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const firstRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80);
  }, []);

  function set(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  function setTrainee(idx: number, key: keyof TraineeRow, val: string) {
    setTrainees((prev) => prev.map((t, i) => i === idx ? { ...t, [key]: val } : t));
  }

  function addTrainee() {
    setTrainees((prev) => [...prev, { name: "", cpf: "" }]);
  }

  function removeTrainee(idx: number) {
    setTrainees((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    setProgress({ done: 0, total: trainees.length });

    const created: TrainingRow[] = [];

    for (let i = 0; i < trainees.length; i++) {
      const trainee = trainees[i];
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          traineeName: trainee.name,
          traineeCpf: trainee.cpf.replace(/\D/g, ""),
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as {
          error: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
        };
        let msg = `Erro ao emitir treinamento para ${trainee.name || `treinando ${i + 1}`}.`;
        if (typeof json.error === "string") msg = json.error;
        else if (json.error?.fieldErrors) {
          const first = Object.values(json.error.fieldErrors).flat()[0];
          if (first) msg = first;
        }
        setPending(false);
        setProgress(null);
        setError(msg);
        return;
      }

      const json = (await res.json()) as { training: TrainingRow };
      created.push(json.training);
      setProgress({ done: i + 1, total: trainees.length });
    }

    setPending(false);
    setProgress(null);
    onCreated(created);
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
        style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(15,26,46,0.3)" }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 70,
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
          <div className="cpv-form-2col">
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

          {/* Treinandos */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={labelStyle}>
                Treinandos <span style={{ color: "var(--destructive)" }}>*</span>
              </span>
              <button
                type="button"
                onClick={addTrainee}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, color: "var(--azul-eletrico)", padding: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                Adicionar treinando
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trainees.map((trainee, idx) => (
                <div key={idx} style={{ background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 12px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>
                      Treinando {trainees.length > 1 ? idx + 1 : ""}
                    </span>
                    {trainees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrainee(idx)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)", padding: 0, fontSize: 12 }}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <div className="cpv-form-2col" style={{ gap: 8 }}>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={trainee.name}
                      onChange={(e) => setTrainee(idx, "name", e.target.value)}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={trainee.cpf}
                      onChange={(e) => setTrainee(idx, "cpf", maskCpf(e.target.value))}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
            </div>
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
              {progress
                ? `Emitindo ${progress.done}/${progress.total}…`
                : trainees.length > 1
                  ? `Emitir ${trainees.length} treinamentos`
                  : "Emitir treinamento"}
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

// ─── Row Actions Menu ─────────────────────────────────────────────────────────

function RowMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen((v) => !v);
  }

  return (
    <div style={{ display: "inline-block" }}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          background: "none", border: "1px solid var(--border)", cursor: "pointer",
          borderRadius: "var(--radius-md)", padding: "4px 8px", display: "flex",
          alignItems: "center", color: "var(--muted-foreground)", transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nevoa)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        aria-label="Ações"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="2" cy="7" r="1.2" fill="currentColor" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" />
          <circle cx="12" cy="7" r="1.2" fill="currentColor" />
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed", top: pos.top, right: pos.right, zIndex: 9999,
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", boxShadow: "0 8px 24px rgba(15,26,46,0.14)",
            minWidth: 200, padding: "4px 0",
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>,
        document.body,
      )}
    </div>
  );
}

function MenuItem({
  onClick, href, download, color, children,
}: {
  onClick?: () => void;
  href?: string;
  download?: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px", fontSize: 13, fontWeight: 500,
    color: color ?? "var(--foreground)", textDecoration: "none",
    cursor: "pointer", width: "100%", border: "none", background: "none",
    textAlign: "left",
  };
  const hover = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.background = "var(--nevoa)");
  const leave = (e: React.MouseEvent<HTMLElement>) =>
    (e.currentTarget.style.background = "none");

  if (href) {
    return (
      <a href={href} download={download} style={style} onMouseEnter={hover} onMouseLeave={leave} target={download ? undefined : "_blank"} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style} onMouseEnter={hover} onMouseLeave={leave}>
      {children}
    </button>
  );
}

function MenuDivider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />;
}

// ─── Edit Training Panel ──────────────────────────────────────────────────────

function EditTrainingPanel({
  training,
  trainingTypes,
  collaborators,
  onClose,
  onSaved,
}: {
  training: TrainingRow;
  trainingTypes: TrainingType[];
  collaborators: Collaborator[];
  onClose: () => void;
  onSaved: (updated: TrainingRow, created: TrainingRow[]) => void;
}) {
  const [fields, setFields] = useState({
    trainingTypeId: training.trainingType.id,
    instructorId: training.instructor.id,
    startsAt: training.startsAt.slice(0, 16),
    endsAt: training.endsAt.slice(0, 16),
    traineeName: training.traineeName,
    traineeCpf: maskCpf(training.traineeCpf),
    clientCompanyName: training.clientCompanyName,
  });
  const [extraTrainees, setExtraTrainees] = useState<TraineeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  function setExtra(idx: number, key: keyof TraineeRow, val: string) {
    setExtraTrainees((prev) => prev.map((t, i) => i === idx ? { ...t, [key]: val } : t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const total = 1 + extraTrainees.length;
    setProgress({ done: 0, total });

    // 1. Update existing training
    const patchRes = await fetch(`/api/trainings/${training.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, traineeCpf: fields.traineeCpf.replace(/\D/g, "") }),
    });

    if (!patchRes.ok) {
      const json = (await patchRes.json()) as { error: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> } };
      let msg = "Erro ao salvar.";
      if (typeof json.error === "string") msg = json.error;
      else if (json.error?.fieldErrors) {
        const first = Object.values(json.error.fieldErrors).flat()[0];
        if (first) msg = first;
      }
      setPending(false); setProgress(null); setError(msg); return;
    }

    const updated = ((await patchRes.json()) as { training: TrainingRow }).training;
    setProgress({ done: 1, total });

    // 2. Create additional trainees
    const created: TrainingRow[] = [];
    for (let i = 0; i < extraTrainees.length; i++) {
      const trainee = extraTrainees[i];
      const res = await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingTypeId: fields.trainingTypeId,
          instructorId: fields.instructorId,
          startsAt: fields.startsAt,
          endsAt: fields.endsAt,
          clientCompanyName: fields.clientCompanyName,
          traineeName: trainee.name,
          traineeCpf: trainee.cpf.replace(/\D/g, ""),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> } };
        let msg = `Erro ao criar treinamento para ${trainee.name || `treinando ${i + 2}`}.`;
        if (typeof json.error === "string") msg = json.error;
        setPending(false); setProgress(null); setError(msg); return;
      }
      created.push(((await res.json()) as { training: TrainingRow }).training);
      setProgress({ done: 2 + i, total });
    }

    setPending(false); setProgress(null);
    onSaved(updated, created);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 36, padding: "0 12px",
    border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
    background: "var(--card)", color: "var(--foreground)", fontSize: 14, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 6 };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(15,26,46,0.3)" }} onClick={onClose} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 70, width: "100%", maxWidth: 520, background: "var(--card)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 32px rgba(15,26,46,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--tinta)", margin: "0 0 3px" }}>Editar treinamento</h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>{training.traineeName} · {training.trainingType.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 6 }}><XIcon /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          <div>
            <label style={labelStyle}>Tipo de treinamento</label>
            <select required value={fields.trainingTypeId} onChange={set("trainingTypeId")} style={inputStyle}>
              {trainingTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Instrutor</label>
            <select required value={fields.instructorId} onChange={set("instructorId")} style={inputStyle}>
              {collaborators.map((c) => <option key={c.id} value={c.id}>{c.name}{c.jobTitle ? ` — ${c.jobTitle}` : ""}</option>)}
            </select>
          </div>

          <div className="cpv-form-2col">
            <div>
              <label style={labelStyle}>Início</label>
              <input type="datetime-local" required value={fields.startsAt} onChange={set("startsAt")} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Término</label>
              <input type="datetime-local" required value={fields.endsAt} onChange={set("endsAt")} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Empresa cliente</label>
            <input type="text" required value={fields.clientCompanyName} onChange={set("clientCompanyName")} style={inputStyle} />
          </div>

          {/* Treinando existente */}
          <div style={{ background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 12px 10px" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 8 }}>
              Treinando (existente)
            </span>
            <div className="cpv-form-2col" style={{ gap: 8 }}>
              <input type="text" required placeholder="Nome completo" value={fields.traineeName}
                onChange={set("traineeName")} style={inputStyle} />
              <input type="text" required placeholder="000.000.000-00" maxLength={14} value={fields.traineeCpf}
                onChange={(e) => setFields((p) => ({ ...p, traineeCpf: maskCpf(e.target.value) }))}
                style={inputStyle} />
            </div>
          </div>

          {/* Treinandos adicionais */}
          {extraTrainees.map((trainee, idx) => (
            <div key={idx} style={{ background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 12px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>Treinando {idx + 2}</span>
                <button type="button" onClick={() => setExtraTrainees((p) => p.filter((_, i) => i !== idx))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)", padding: 0, fontSize: 12 }}>
                  Remover
                </button>
              </div>
              <div className="cpv-form-2col" style={{ gap: 8 }}>
                <input type="text" required placeholder="Nome completo" value={trainee.name}
                  onChange={(e) => setExtra(idx, "name", e.target.value)} style={inputStyle} />
                <input type="text" required placeholder="000.000.000-00" maxLength={14} value={trainee.cpf}
                  onChange={(e) => setExtra(idx, "cpf", maskCpf(e.target.value))} style={inputStyle} />
              </div>
            </div>
          ))}

          <button type="button" onClick={() => setExtraTrainees((p) => [...p, { name: "", cpf: "" }])}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--azul-eletrico)", padding: 0, alignSelf: "flex-start" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Adicionar treinando
          </button>

          {error && <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>}

          <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 10 }}>
            <button type="submit" disabled={pending} className="cpv-btn cpv-btn--primary" style={{ flex: 1 }}>
              {progress
                ? `Salvando ${progress.done}/${progress.total}…`
                : extraTrainees.length > 0
                  ? `Salvar + emitir ${extraTrainees.length} novo${extraTrainees.length > 1 ? "s" : ""}`
                  : "Salvar alterações"}
            </button>
            <button type="button" onClick={onClose} style={{ flexShrink: 0, height: 40, padding: "0 14px", border: "none", borderRadius: "var(--radius-md)", background: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function SignLinkModal({
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
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,26,46,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--card)", borderRadius: "var(--radius-xl)", boxShadow: "0 24px 48px rgba(15,26,46,0.18)", width: "100%", maxWidth: 420, padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--tinta)", margin: "0 0 2px" }}>
              Link de assinatura
            </h2>
            <p style={{ margin: 0, fontSize: 12, color: "var(--muted-foreground)" }}>
              {traineeName} · {trainingType}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 4 }}>
            <XIcon />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)", fontSize: 13 }}>Carregando…</p>
        ) : (
          <>
            {/* Status badge */}
            {isSigned ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--success-soft)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", padding: "8px 12px", marginBottom: 14 }}>
                <span style={{ color: "var(--success)" }}>✓</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
                  Assinado{signedAt ? ` em ${new Date(signedAt).toLocaleDateString("pt-BR")}` : ""}
                </span>
              </div>
            ) : (
              <div style={{ background: "var(--warning-soft)", border: "1px solid var(--warning-border)", borderRadius: "var(--radius-md)", padding: "8px 12px", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warning)" }}>Aguardando assinatura</span>
              </div>
            )}

            {/* Link */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--nevoa)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "7px 10px", marginBottom: 14 }}>
              <span style={{ flex: 1, fontSize: 11, color: "var(--azul-eletrico)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
                {signUrl || "—"}
              </span>
              <button onClick={copyLink} title="Copiar" style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: copied ? "var(--success)" : "var(--muted-foreground)", padding: 2, display: "flex" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copyLink} className="cpv-btn cpv-btn--primary cpv-btn--sm" style={{ flex: 1, justifyContent: "center", gap: 6 }}>
                {copied ? "✓ Copiado!" : "Copiar link"}
              </button>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="cpv-btn cpv-btn--outline cpv-btn--sm" style={{ flex: 1, justifyContent: "center", gap: 6, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5A6.9 6.9 0 0 0 8 0C3.58 0 0 3.58 0 8c0 1.41.37 2.75 1.01 3.91L0 16l4.19-1.1A7.93 7.93 0 0 0 8 16c4.42 0 8-3.58 8-8 0-2.14-.83-4.14-2.5-5.5ZM8 14.5a6.4 6.4 0 0 1-3.27-.9l-.23-.14-2.49.65.67-2.42-.16-.25A6.46 6.46 0 0 1 1.5 8c0-3.59 2.91-6.5 6.5-6.5S14.5 4.41 14.5 8 11.59 14.5 8 14.5Zm3.56-4.87c-.19-.1-1.14-.56-1.32-.63-.17-.06-.3-.1-.42.1-.13.19-.49.63-.6.75-.11.13-.22.14-.41.05-.19-.1-.8-.3-1.52-.95-.56-.5-.94-1.12-1.05-1.31-.11-.19-.01-.29.08-.38.09-.09.19-.23.29-.34.1-.12.13-.19.19-.32.07-.13.03-.24-.01-.34-.05-.1-.42-1.01-.58-1.38-.15-.36-.3-.31-.42-.32h-.36c-.12 0-.32.04-.49.24-.17.19-.64.63-.64 1.53s.66 1.77.75 1.9c.1.12 1.3 1.98 3.15 2.78.44.19.78.3 1.05.38.44.14.84.12 1.16.07.35-.05 1.09-.45 1.24-.88.15-.43.15-.8.1-.88-.04-.08-.17-.13-.36-.22Z" fill="currentColor"/></svg>
                WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
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
  const [editTraining, setEditTraining] = useState<TrainingRow | null>(null);
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

  function handleCreated(created: TrainingRow[]) {
    setTrainings((prev) => [...created, ...prev]);
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
        className="cpv-topbar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
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
      <div className="cpv-page" style={{ maxWidth: 1100 }}>
        {/* Heading */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--tinta)", margin: "0 0 4px" }}>
            Treinamentos
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
            Emita e gerencie os comprovantes de treinamento.
          </p>
          </div>
          <button
            className="cpv-btn cpv-btn--primary cpv-hide-mobile"
            onClick={() => setShowPanel(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
          >
            <PlusIcon />
            Novo treinamento
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
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
                width: "100%",
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
              padding: "0 12px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              background: "var(--card)",
              color: "var(--foreground)",
              fontSize: 13,
              outline: "none",
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
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <RowMenu>
                        <MenuItem href={`/verificar/${t.verificationCode}`}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                          Ver comprovante
                        </MenuItem>
                        <MenuItem href={`/api/trainings/${t.id}/pdf`} download>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Baixar PDF
                        </MenuItem>
                        {t.status === "ISSUED" && (() => {
                          const traineeSig = t.signatures.find((s) => s.signerRole === "TRAINEE");
                          const isSigned = traineeSig?.status === "SIGNED";
                          return (
                            <MenuItem
                              onClick={() => openSignLink(t)}
                              color={isSigned ? "var(--success)" : undefined}
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-3 2 2 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              {isSigned ? "Ver assinatura" : "Enviar link de assinatura"}
                            </MenuItem>
                          );
                        })()}
                        {isAdmin && t.status === "ISSUED" && (
                          <MenuItem onClick={() => setEditTraining(t)}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5a1.2 1.2 0 0 1 1.7 1.7l-7 7-2.2.5.5-2.2 7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Editar treinamento
                          </MenuItem>
                        )}
                        {isAdmin && t.status === "ISSUED" && (
                          <>
                            <MenuDivider />
                            <MenuItem
                              onClick={() => { setCancelId(t.id); setCancelError(null); }}
                              color="var(--destructive)"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                              Cancelar treinamento
                            </MenuItem>
                          </>
                        )}
                      </RowMenu>
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

      {/* Edit training panel */}
      {editTraining && (
        <EditTrainingPanel
          training={editTraining}
          trainingTypes={trainingTypes}
          collaborators={collaborators}
          onClose={() => setEditTraining(null)}
          onSaved={(updated, created) => {
            setTrainings((prev) => [
              ...created,
              ...prev.map((t) => (t.id === updated.id ? updated : t)),
            ]);
            setEditTraining(null);
          }}
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
          <SignLinkModal
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
