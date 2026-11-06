"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskCpf } from "@/lib/format";

type TrainingStatus = "ISSUED" | "CANCELED";

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
};

type TrainingType = { id: string; name: string };
type Collaborator = { id: string; name: string; jobTitle: string | null };

type Props = {
  initialTrainings: TrainingRow[];
  trainingTypes: TrainingType[];
  collaborators: Collaborator[];
  isAdmin: boolean;
};

function StatusBadge({ status }: { status: TrainingStatus }) {
  if (status === "ISSUED") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border cpv-badge--assinado"
        style={{
          background: "var(--success-soft)",
          color: "var(--success)",
          borderColor: "var(--success-border)",
        }}
      >
        Emitido
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border cpv-badge--recusado"
      style={{
        background: "var(--destructive-soft)",
        color: "var(--destructive)",
        borderColor: "var(--destructive-border)",
      }}
    >
      Cancelado
    </span>
  );
}

function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const startDate = fmt(startsAt);
  const endDate = fmt(endsAt);

  if (startDate === endDate) {
    return `${startDate} ${fmtTime(startsAt)}–${fmtTime(endsAt)}`;
  }
  return `${startDate} – ${endDate}`;
}

const EMPTY_FORM = {
  trainingTypeId: "",
  instructorId: "",
  startsAt: "",
  endsAt: "",
  traineeName: "",
  traineeCpf: "",
  clientCompanyName: "",
};

export function TreinamentosClient({
  initialTrainings,
  trainingTypes,
  collaborators,
  isAdmin,
}: Props) {
  const [trainings, setTrainings] = useState<TrainingRow[]>(initialTrainings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrainingStatus | "">("");

  // New training form
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formPending, setFormPending] = useState(false);

  // Cancel modal
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelPending, setCancelPending] = useState(false);

  function setField(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const filtered = useMemo(() => {
    let list = trainings;
    if (filterStatus) list = list.filter((t) => t.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.traineeName.toLowerCase().includes(q));
    }
    return list;
  }, [trainings, search, filterStatus]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormPending(true);

    const res = await fetch("/api/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formFields,
        traineeCpf: formFields.traineeCpf.replace(/\D/g, ""),
      }),
    });

    setFormPending(false);

    if (!res.ok) {
      const json = (await res.json()) as { error: string | { formErrors?: string[] } };
      const msg =
        typeof json.error === "string"
          ? json.error
          : (json.error?.formErrors?.[0] ?? "Erro ao emitir treinamento.");
      setFormError(msg);
      return;
    }

    const json = (await res.json()) as { training: TrainingRow };
    setTrainings((prev) => [json.training, ...prev]);
    setFormFields(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleCancel() {
    if (!cancelId) return;
    setCancelError(null);
    setCancelPending(true);

    const res = await fetch(`/api/trainings/${cancelId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: cancelReason }),
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
    setCancelReason("");
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full sm:w-auto">
          <Input
            placeholder="Buscar por treinando…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TrainingStatus | "")}
            className="rounded-md border px-3 py-2 text-sm"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <option value="">Todos os status</option>
            <option value="ISSUED">Emitido</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
          variant="default"
        >
          Novo treinamento
        </Button>
      </div>

      {/* New training form */}
      {showForm && (
        <div
          className="rounded-xl border p-6"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2
            className="text-base font-semibold mb-5"
            style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
          >
            Emitir treinamento
          </h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Training Type */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-type">Tipo de treinamento</Label>
                <select
                  id="tt-type"
                  required
                  value={formFields.trainingTypeId}
                  onChange={setField("trainingTypeId")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    height: "var(--control-md)",
                  }}
                >
                  <option value="">Selecione…</option>
                  {trainingTypes.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-instructor">Instrutor</Label>
                <select
                  id="tt-instructor"
                  required
                  value={formFields.instructorId}
                  onChange={setField("instructorId")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    height: "var(--control-md)",
                  }}
                >
                  <option value="">Selecione…</option>
                  {collaborators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.jobTitle ? ` — ${c.jobTitle}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Starts At */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-starts">Data/hora início</Label>
                <Input
                  id="tt-starts"
                  type="datetime-local"
                  required
                  value={formFields.startsAt}
                  onChange={setField("startsAt")}
                />
              </div>

              {/* Ends At */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-ends">Data/hora término</Label>
                <Input
                  id="tt-ends"
                  type="datetime-local"
                  required
                  value={formFields.endsAt}
                  onChange={setField("endsAt")}
                />
              </div>

              {/* Trainee Name */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-trainee-name">Nome do treinando</Label>
                <Input
                  id="tt-trainee-name"
                  required
                  value={formFields.traineeName}
                  onChange={setField("traineeName")}
                  placeholder="João da Silva"
                />
              </div>

              {/* Trainee CPF */}
              <div className="space-y-1.5">
                <Label htmlFor="tt-trainee-cpf">CPF do treinando</Label>
                <Input
                  id="tt-trainee-cpf"
                  required
                  value={formFields.traineeCpf}
                  onChange={(e) =>
                    setFormFields((p) => ({ ...p, traineeCpf: maskCpf(e.target.value) }))
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Client Company */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tt-client-company">Empresa cliente</Label>
                <Input
                  id="tt-client-company"
                  required
                  value={formFields.clientCompanyName}
                  onChange={setField("clientCompanyName")}
                  placeholder="Nome da empresa contratante"
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={formPending}>
                {formPending ? "Emitindo…" : "Emitir treinamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--muted-foreground)" }}>
          {trainings.length === 0
            ? "Nenhum treinamento emitido ainda."
            : "Nenhum treinamento encontrado com esses filtros."}
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: "var(--nevoa)",
                }}
              >
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Período
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Treinando
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Tipo
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Instrutor
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Status
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                      {formatDateRange(t.startsAt, t.endsAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium" style={{ color: "var(--foreground)" }}>
                      {t.traineeName}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {maskCpf(t.traineeCpf)}
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {t.trainingType.name}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {t.instructor.name}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <a
                        href={`/verificar/${t.verificationCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium"
                        style={{ color: "var(--azul-eletrico)" }}
                      >
                        Ver
                      </a>
                      <a
                        href={`/api/trainings/${t.id}/pdf`}
                        download
                        className="text-xs font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        PDF
                      </a>
                      {isAdmin && t.status === "ISSUED" && (
                        <button
                          onClick={() => {
                            setCancelId(t.id);
                            setCancelReason("");
                            setCancelError(null);
                          }}
                          className="text-xs font-medium"
                          style={{ color: "var(--destructive)" }}
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
        </div>
      )}

      {/* Cancel modal */}
      {cancelId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(11,27,63,0.5)" }}
        >
          <div
            className="w-full max-w-md rounded-xl border p-6 space-y-4"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
            >
              Cancelar treinamento
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Esta ação é irreversível. Informe o motivo do cancelamento.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="cancel-reason">Motivo</Label>
              <textarea
                id="cancel-reason"
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Descreva o motivo com ao menos 10 caracteres…"
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  outline: "none",
                }}
              />
            </div>
            {cancelError && (
              <p className="text-sm" style={{ color: "var(--destructive)" }}>
                {cancelError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCancelId(null)}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={cancelPending || cancelReason.length < 10}
                style={{
                  background: "var(--destructive)",
                  color: "var(--destructive-foreground)",
                }}
              >
                {cancelPending ? "Cancelando…" : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
