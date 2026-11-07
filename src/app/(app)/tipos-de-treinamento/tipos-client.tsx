"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type TrainingTypeRow = {
  id: string;
  name: string;
  description: string | null;
  defaultDurationHours: number | null;
  declarationText: string | null;
  archivedAt: string | null;
  createdAt: string;
  usageCount: number;
};

type Props = {
  companyName: string;
  initialTypes: TrainingTypeRow[];
};

type PanelMode = "create" | "edit";

type PanelFields = {
  name: string;
  description: string;
  defaultDurationHours: string;
  declarationText: string;
};

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

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M11.5 1.5a1.42 1.42 0 0 1 2 2l-9 9-2.5.5.5-2.5 9-9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="13" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 5v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M5.5 8.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

function UnarchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="13" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 5v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M5.5 8.5h4M7.5 11V7.5m-2 2l2-2 2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Slide-in Panel ───────────────────────────────────────────────────────────

function Panel({
  mode,
  editType,
  onClose,
  onSaved,
  onArchived,
}: {
  mode: PanelMode;
  editType: TrainingTypeRow | null;
  onClose: () => void;
  onSaved: (t: TrainingTypeRow) => void;
  onArchived: (id: string) => void;
}) {
  const [fields, setFields] = useState<PanelFields>({
    name: editType?.name ?? "",
    description: editType?.description ?? "",
    defaultDurationHours:
      editType?.defaultDurationHours != null
        ? String(editType.defaultDurationHours)
        : "",
    declarationText: editType?.declarationText ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [archivePending, setArchivePending] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 80);
  }, []);

  function set(key: keyof PanelFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const body: Record<string, unknown> = {
      name: fields.name,
      description: fields.description || undefined,
      defaultDurationHours: fields.defaultDurationHours
        ? parseFloat(fields.defaultDurationHours)
        : undefined,
      declarationText: fields.declarationText || undefined,
    };

    const url =
      mode === "create"
        ? "/api/training-types"
        : `/api/training-types/${editType!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setPending(false);

    if (!res.ok) {
      const json = (await res.json()) as {
        error: string | { formErrors?: string[] };
      };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao salvar.");
      setError(msg);
      return;
    }

    const json = (await res.json()) as { type: TrainingTypeRow };
    onSaved(json.type);
  }

  async function handleArchive() {
    if (!editType) return;
    if (!confirm(`Arquivar "${editType.name}"? Ele não poderá mais ser usado em novos treinamentos.`))
      return;
    setArchivePending(true);
    const res = await fetch(`/api/training-types/${editType.id}`, {
      method: "DELETE",
    });
    setArchivePending(false);
    if (res.ok) onArchived(editType.id);
  }

  async function handleUnarchive() {
    if (!editType) return;
    setPending(true);
    const res = await fetch(`/api/training-types/${editType.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archivedAt: null }),
    });
    setPending(false);
    if (res.ok) {
      const json = (await res.json()) as { type: TrainingTypeRow };
      onSaved(json.type);
    }
  }

  const isArchived = editType?.archivedAt != null;

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
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(15,26,46,0.3)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "100%",
          maxWidth: 480,
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-8px 0 32px rgba(15,26,46,0.12)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Panel header */}
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
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 17,
                color: "var(--tinta)",
                margin: 0,
              }}
            >
              {mode === "create" ? "Novo tipo de treinamento" : fields.name || "Editar tipo"}
            </h2>
            {mode === "edit" && editType && (
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>
                {editType.usageCount} uso{editType.usageCount !== 1 ? "s" : ""} · criado em{" "}
                {new Date(editType.createdAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
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
          style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}
        >
          {/* Nome */}
          <div>
            <label htmlFor="tt-name" style={labelStyle}>
              Nome <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              id="tt-name"
              ref={firstInputRef}
              type="text"
              required
              value={fields.name}
              onChange={set("name")}
              placeholder="Ex: NR-35 Trabalho em Altura"
              style={inputStyle}
              disabled={isArchived}
            />
          </div>

          {/* Descrição / Conteúdo programático */}
          <div>
            <label htmlFor="tt-description" style={labelStyle}>
              Conteúdo programático
            </label>
            <textarea
              id="tt-description"
              value={fields.description}
              onChange={set("description")}
              placeholder="Tópicos abordados no treinamento (opcional)"
              rows={4}
              style={{
                ...inputStyle,
                height: "auto",
                padding: "10px 12px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
              disabled={isArchived}
            />
          </div>

          {/* Carga horária */}
          <div>
            <label htmlFor="tt-hours" style={labelStyle}>
              Carga horária padrão (horas)
            </label>
            <input
              id="tt-hours"
              type="number"
              min="0.5"
              step="0.5"
              value={fields.defaultDurationHours}
              onChange={set("defaultDurationHours")}
              placeholder="Ex: 8"
              style={inputStyle}
              disabled={isArchived}
            />
            <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>
              Sugerida ao emitir um treinamento deste tipo.
            </p>
          </div>

          {/* Texto de declaração */}
          <div>
            <label htmlFor="tt-declaration" style={labelStyle}>
              Texto de declaração
            </label>
            <textarea
              id="tt-declaration"
              value={fields.declarationText}
              onChange={set("declarationText")}
              placeholder="Texto que aparece no comprovante como declaração do treinamento (opcional)"
              rows={5}
              style={{
                ...inputStyle,
                height: "auto",
                padding: "10px 12px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
              disabled={isArchived}
            />
            <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>
              Aparece no PDF do comprovante como declaração do conteúdo.
            </p>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--destructive)" }}>{error}</p>
          )}

          {/* Footer buttons */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {!isArchived && (
              <button
                type="submit"
                disabled={pending}
                className="cpv-btn cpv-btn--primary"
                style={{ flex: 1 }}
              >
                {pending ? "Salvando…" : mode === "create" ? "Criar tipo" : "Salvar alterações"}
              </button>
            )}

            {mode === "edit" && !isArchived && (
              <button
                type="button"
                disabled={archivePending}
                onClick={handleArchive}
                title="Arquivar tipo"
                style={{
                  flexShrink: 0,
                  height: 40,
                  padding: "0 14px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "none",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <ArchiveIcon />
                {archivePending ? "Arquivando…" : "Arquivar"}
              </button>
            )}

            {mode === "edit" && isArchived && (
              <button
                type="button"
                disabled={pending}
                onClick={handleUnarchive}
                className="cpv-btn cpv-btn--outline"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <UnarchiveIcon />
                {pending ? "Restaurando…" : "Restaurar tipo"}
              </button>
            )}

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

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "ativos" | "arquivados";

export function TiposClient({ companyName, initialTypes }: Props) {
  const [types, setTypes] = useState<TrainingTypeRow[]>(initialTypes);
  const [activeTab, setActiveTab] = useState<TabId>("ativos");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<{
    open: boolean;
    mode: PanelMode;
    editType: TrainingTypeRow | null;
  }>({ open: false, mode: "create", editType: null });

  function openCreate() {
    setPanel({ open: true, mode: "create", editType: null });
  }

  function openEdit(t: TrainingTypeRow) {
    setPanel({ open: true, mode: "edit", editType: t });
  }

  function closePanel() {
    setPanel((p) => ({ ...p, open: false }));
  }

  function handleSaved(saved: TrainingTypeRow) {
    setTypes((prev) => {
      const existing = prev.find((t) => t.id === saved.id);
      if (existing) {
        return prev.map((t) => (t.id === saved.id ? { ...t, ...saved } : t));
      }
      return [...prev, saved];
    });
    closePanel();
    // Switch tab to show the saved type
    if (saved.archivedAt) setActiveTab("arquivados");
    else setActiveTab("ativos");
  }

  function handleArchived(id: string) {
    setTypes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, archivedAt: new Date().toISOString() } : t,
      ),
    );
    closePanel();
    setActiveTab("arquivados");
  }

  const activeTypes = types.filter((t) => t.archivedAt === null);
  const archivedTypes = types.filter((t) => t.archivedAt !== null);

  const displayTypes = (activeTab === "ativos" ? activeTypes : archivedTypes).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q)
    );
  });

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "ativos", label: "Ativos", count: activeTypes.length },
    { id: "arquivados", label: "Arquivados", count: archivedTypes.length },
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
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>
            Tipos de treinamento
          </span>
        </div>

        {/* Action */}
        <button
          className="cpv-btn cpv-btn--primary cpv-btn--sm"
          onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <PlusIcon />
          Novo tipo
        </button>
      </div>

      {/* Page body */}
      <div style={{ padding: "28px 32px", maxWidth: 1100 }}>
        {/* Heading */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--tinta)",
                margin: "0 0 4px",
              }}
            >
              Tipos de treinamento
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)" }}>
              Modelos de treinamento emitidos pela {companyName}
            </p>
          </div>
          <button
            className="cpv-btn cpv-btn--primary"
            onClick={openCreate}
            style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
          >
            <PlusIcon />
            Novo tipo
          </button>
        </div>

        {/* Tabs row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--azul-eletrico)"
                    : "2px solid transparent",
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
                  background:
                    activeTab === tab.id ? "var(--azul-gelo)" : "var(--nevoa)",
                  color:
                    activeTab === tab.id
                      ? "var(--azul-eletrico)"
                      : "var(--muted-foreground)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
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
            placeholder="Buscar por nome"
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

        {/* Table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {displayTypes.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--muted-foreground)",
                fontSize: 14,
              }}
            >
              {search
                ? "Nenhum resultado encontrado."
                : activeTab === "ativos"
                  ? "Nenhum tipo ativo. Crie o primeiro clicando em \u201cNovo tipo\u201d."
                  : "Nenhum tipo arquivado."}
            </div>
          ) : (
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--nevoa)",
                  }}
                >
                  {["NOME", "CARGA HOR.", "USO", ""].map((col, i) => (
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
                        ...(i === 3 ? { width: 60 } : {}),
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayTypes.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      opacity: t.archivedAt ? 0.6 : 1,
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: t.archivedAt
                              ? "var(--muted-foreground)"
                              : "var(--foreground)",
                            textDecoration: t.archivedAt ? "line-through" : "none",
                          }}
                        >
                          {t.name}
                        </span>
                        {t.description && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted-foreground)",
                              marginTop: 2,
                              maxWidth: 480,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.defaultDurationHours != null
                        ? `${t.defaultDurationHours}h`
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                      }}
                    >
                      {t.usageCount}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => openEdit(t)}
                        title="Editar"
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
                        <PencilIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-in panel */}
      {panel.open && (
        <Panel
          mode={panel.mode}
          editType={panel.editType}
          onClose={closePanel}
          onSaved={handleSaved}
          onArchived={handleArchived}
        />
      )}
    </div>
  );
}
