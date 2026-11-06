"use client";

import { useState } from "react";

type TrainingTypeRow = {
  id: string;
  name: string;
  description: string | null;
  archivedAt: string | null;
  createdAt: string;
};

type Props = {
  initialTypes: TrainingTypeRow[];
};

type FormFields = {
  name: string;
  description: string;
};

function ArchivedBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{
        background: "var(--muted)",
        color: "var(--muted-foreground)",
        borderColor: "var(--border)",
      }}
    >
      Arquivado
    </span>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function TiposClient({ initialTypes }: Props) {
  const [types, setTypes] = useState<TrainingTypeRow[]>(initialTypes);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFields, setNewFields] = useState<FormFields>({ name: "", description: "" });
  const [newError, setNewError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<FormFields>({ name: "", description: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [editPending, setEditPending] = useState(false);

  const [archivePending, setArchivePending] = useState<string | null>(null);

  async function refreshTypes() {
    const res = await fetch("/api/training-types");
    if (!res.ok) return;
    // GET returns active only — we need all, so we fetch and merge
    const data = (await res.json()) as { types: TrainingTypeRow[] };
    // Keep archived rows from current state, replace active ones
    setTypes((prev) => {
      const archived = prev.filter((t) => t.archivedAt !== null);
      const freshActive = data.types;
      return [...freshActive, ...archived];
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setNewError(null);
    setCreatePending(true);

    const res = await fetch("/api/training-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFields.name,
        description: newFields.description || undefined,
      }),
    });

    setCreatePending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string | { formErrors?: string[] } };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao criar tipo de treinamento.");
      setNewError(msg);
      return;
    }

    const json = (await res.json()) as { type: TrainingTypeRow };
    setTypes((prev) => {
      // Insert new active type in alphabetical order
      const withNew = [...prev.filter((t) => t.archivedAt === null), json.type].sort((a, b) =>
        a.name.localeCompare(b.name, "pt-BR"),
      );
      return [...withNew, ...prev.filter((t) => t.archivedAt !== null)];
    });
    setNewFields({ name: "", description: "" });
    setShowNewForm(false);
  }

  function startEdit(type: TrainingTypeRow) {
    setEditingId(type.id);
    setEditFields({ name: type.name, description: type.description ?? "" });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleUpdate(e: React.FormEvent, id: string) {
    e.preventDefault();
    setEditError(null);
    setEditPending(true);

    const res = await fetch(`/api/training-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editFields.name,
        description: editFields.description || undefined,
      }),
    });

    setEditPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string | { formErrors?: string[] } };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao atualizar tipo de treinamento.");
      setEditError(msg);
      return;
    }

    const json = (await res.json()) as { type: TrainingTypeRow };
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...json.type } : t)),
    );
    setEditingId(null);
  }

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja arquivar "${name}"?`)) return;
    setArchivePending(id);

    const res = await fetch(`/api/training-types/${id}`, { method: "DELETE" });
    setArchivePending(null);

    if (!res.ok) return;

    setTypes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, archivedAt: new Date().toISOString() } : t,
      ),
    );
  }

  const activeTypes = types.filter((t) => t.archivedAt === null);
  const archivedTypes = types.filter((t) => t.archivedAt !== null);

  const inputStyle: React.CSSProperties = {
    height: "var(--control-sm)",
    padding: "0 var(--space-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    background: "var(--card)",
    color: "var(--foreground)",
    fontSize: "14px",
    fontFamily: "var(--font-sans)",
    outline: "none",
    width: "100%",
  };

  const tdStyle: React.CSSProperties = {
    height: "var(--table-row)",
    padding: "0 16px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  };

  const thStyle: React.CSSProperties = {
    height: "40px",
    padding: "0 16px",
    borderBottom: "1px solid var(--border)",
    background: "var(--nevoa)",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--muted-foreground)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      {/* Header action */}
      <div className="flex items-center justify-between mb-4">
        <span />
        <button
          className="cpv-btn cpv-btn--primary cpv-btn--sm"
          onClick={() => {
            setShowNewForm((v) => !v);
            setNewError(null);
            setNewFields({ name: "", description: "" });
          }}
        >
          + Novo tipo
        </button>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            fontFamily: "var(--font-sans)",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Descrição</th>
              <th style={{ ...thStyle, width: "120px" }}>Status</th>
              <th style={{ ...thStyle, width: "120px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* New type inline form row */}
            {showNewForm && (
              <tr style={{ background: "var(--accent)" }}>
                <td style={{ ...tdStyle, borderBottom: "1px solid var(--border)" }}>
                  <form id="new-type-form" onSubmit={handleCreate} />
                  <input
                    form="new-type-form"
                    style={inputStyle}
                    type="text"
                    placeholder="Nome do tipo *"
                    required
                    value={newFields.name}
                    onChange={(e) =>
                      setNewFields((p) => ({ ...p, name: e.target.value }))
                    }
                    autoFocus
                  />
                </td>
                <td style={{ ...tdStyle, borderBottom: "1px solid var(--border)" }}>
                  <input
                    form="new-type-form"
                    style={inputStyle}
                    type="text"
                    placeholder="Descrição (opcional)"
                    value={newFields.description}
                    onChange={(e) =>
                      setNewFields((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                  {newError && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--destructive)" }}
                    >
                      {newError}
                    </p>
                  )}
                </td>
                <td style={{ ...tdStyle, borderBottom: "1px solid var(--border)" }} />
                <td style={{ ...tdStyle, borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <button
                      form="new-type-form"
                      type="submit"
                      disabled={createPending}
                      className="cpv-btn cpv-btn--primary cpv-btn--sm"
                    >
                      {createPending ? "Salvando…" : "Salvar"}
                    </button>
                    <button
                      type="button"
                      className="cpv-btn cpv-btn--outline cpv-btn--sm"
                      onClick={() => setShowNewForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Active type rows */}
            {activeTypes.length === 0 && !showNewForm && (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Nenhum tipo de treinamento cadastrado ainda.
                </td>
              </tr>
            )}

            {activeTypes.map((type) =>
              editingId === type.id ? (
                <tr key={type.id} style={{ background: "var(--accent)" }}>
                  <td style={tdStyle}>
                    <form id={`edit-form-${type.id}`} onSubmit={(e) => handleUpdate(e, type.id)} />
                    <input
                      form={`edit-form-${type.id}`}
                      style={inputStyle}
                      type="text"
                      required
                      value={editFields.name}
                      onChange={(e) =>
                        setEditFields((p) => ({ ...p, name: e.target.value }))
                      }
                      autoFocus
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      form={`edit-form-${type.id}`}
                      style={inputStyle}
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={editFields.description}
                      onChange={(e) =>
                        setEditFields((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                    {editError && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--destructive)" }}
                      >
                        {editError}
                      </p>
                    )}
                  </td>
                  <td style={tdStyle} />
                  <td style={tdStyle}>
                    <div className="flex items-center gap-2">
                      <button
                        form={`edit-form-${type.id}`}
                        type="submit"
                        disabled={editPending}
                        className="cpv-btn cpv-btn--primary cpv-btn--sm"
                      >
                        {editPending ? "Salvando…" : "Salvar"}
                      </button>
                      <button
                        type="button"
                        className="cpv-btn cpv-btn--outline cpv-btn--sm"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={type.id}>
                  <td
                    style={{ ...tdStyle, fontWeight: 500, color: "var(--foreground)" }}
                  >
                    {type.name}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--muted-foreground)" }}>
                    {type.description ?? (
                      <span style={{ color: "var(--border)" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                      style={{
                        background: "var(--success-soft)",
                        color: "var(--success)",
                        borderColor: "var(--success-border)",
                      }}
                    >
                      Ativo
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Editar"
                        onClick={() => startEdit(type)}
                        className="cpv-btn cpv-btn--ghost cpv-btn--sm"
                        style={{ padding: "0 8px", color: "var(--muted-foreground)" }}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        title="Arquivar"
                        disabled={archivePending === type.id}
                        onClick={() => handleArchive(type.id, type.name)}
                        className="cpv-btn cpv-btn--ghost cpv-btn--sm"
                        style={{ padding: "0 8px", color: "var(--muted-foreground)" }}
                      >
                        {archivePending === type.id ? (
                          <span style={{ fontSize: "12px" }}>…</span>
                        ) : (
                          <ArchiveIcon />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}

            {/* Archived type rows */}
            {archivedTypes.map((type) => (
              <tr
                key={type.id}
                style={{ opacity: 0.55, background: "var(--nevoa)" }}
              >
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 500,
                    color: "var(--muted-foreground)",
                    textDecoration: "line-through",
                  }}
                >
                  {type.name}
                </td>
                <td style={{ ...tdStyle, color: "var(--muted-foreground)" }}>
                  {type.description ?? <span style={{ color: "var(--border)" }}>—</span>}
                </td>
                <td style={tdStyle}>
                  <ArchivedBadge />
                </td>
                <td style={tdStyle} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
