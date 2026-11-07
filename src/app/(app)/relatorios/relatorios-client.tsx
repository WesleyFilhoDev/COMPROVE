"use client";

import { useState, useMemo } from "react";
import { ConfirmModal } from "@/components/app/confirm-modal";
import Link from "next/link";

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

type Signature = {
  signerRole: string;
  status: string;
  signedAt: string | null;
};

type Training = {
  id: string;
  verificationCode: string;
  status: string;
  startsAt: string;
  endsAt: string;
  traineeName: string;
  clientCompanyName: string;
  instructor: { id: string; name: string; jobTitle: string | null };
  trainingType: { id: string; name: string };
  signatures: Signature[];
};

type Collaborator = {
  id: string;
  name: string;
};

type TrainingType = {
  id: string;
  name: string;
};

type Props = {
  trainings: Training[];
  collaborators: Collaborator[];
  trainingTypes: TrainingType[];
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getTrainingStatusInfo(t: Training): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  const sigTotal = t.signatures.length;
  const sigSigned = t.signatures.filter((s) => s.status === "SIGNED").length;

  if (t.status === "CANCELED") {
    return {
      label: "Expirado",
      color: "var(--destructive)",
      bg: "var(--destructive-soft)",
      border: "var(--destructive-border)",
    };
  }
  if (sigTotal > 0 && sigSigned === sigTotal) {
    return {
      label: "Assinado",
      color: "var(--success)",
      bg: "var(--success-soft)",
      border: "var(--success-border)",
    };
  }
  return {
    label: sigTotal > 0 ? `Pendente — ${sigSigned} de ${sigTotal}` : "Pendente",
    color: "var(--warning)",
    bg: "var(--warning-soft)",
    border: "var(--warning-border)",
  };
}

function getDurationHours(startsAt: string, endsAt: string): number {
  const diff = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  return diff / (1000 * 60 * 60);
}

const PAGE_SIZE = 10;

export function RelatoriosClient({ trainings, collaborators, trainingTypes }: Props) {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [dateStart, setDateStart] = useState<string>(
    defaultStart.toISOString().slice(0, 10),
  );
  const [dateEnd, setDateEnd] = useState<string>(
    defaultEnd.toISOString().slice(0, 10),
  );
  const [collaboratorId, setCollaboratorId] = useState<string>("all");
  const [typeId, setTypeId] = useState<string>("all");
  const [situacao, setSituacao] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showExportInfo, setShowExportInfo] = useState(false);

  function setThisMonth() {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateStart(s.toISOString().slice(0, 10));
    setDateEnd(e.toISOString().slice(0, 10));
    setPage(1);
  }

  function setLastMonth() {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    setDateStart(s.toISOString().slice(0, 10));
    setDateEnd(e.toISOString().slice(0, 10));
    setPage(1);
  }

  function setLast90() {
    const s = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    setDateStart(s.toISOString().slice(0, 10));
    setDateEnd(now.toISOString().slice(0, 10));
    setPage(1);
  }

  const filtered = useMemo(() => {
    const start = new Date(dateStart + "T00:00:00");
    const end = new Date(dateEnd + "T23:59:59");

    return trainings.filter((t) => {
      const startsAt = new Date(t.startsAt);
      if (startsAt < start || startsAt > end) return false;
      if (collaboratorId !== "all" && t.instructor.id !== collaboratorId) return false;
      if (typeId !== "all" && t.trainingType.id !== typeId) return false;

      if (situacao !== "all") {
        const statusInfo = getTrainingStatusInfo(t);
        const statusKey = t.status === "CANCELED"
          ? "expirado"
          : statusInfo.label.startsWith("Pendente")
            ? "pendente"
            : "assinado";
        if (statusKey !== situacao) return false;
      }

      return true;
    });
  }, [trainings, dateStart, dateEnd, collaboratorId, typeId, situacao]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const participants = filtered.length; // 1 trainee per training
    const totalHours = filtered.reduce((sum, t) => sum + getDurationHours(t.startsAt, t.endsAt), 0);
    const signed = filtered.filter((t) => {
      const sigTotal = t.signatures.length;
      const sigSigned = t.signatures.filter((s) => s.status === "SIGNED").length;
      return t.status === "ISSUED" && sigTotal > 0 && sigSigned === sigTotal;
    }).length;
    const signedPct = total > 0 ? Math.round((signed / total) * 100) : 0;
    return { total, participants, totalHours, signedPct };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (paginated.every((t) => selected.has(t.id))) {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((t) => next.delete(t.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        paginated.forEach((t) => next.add(t.id));
        return next;
      });
    }
  }

  const isAllSelected = paginated.length > 0 && paginated.every((t) => selected.has(t.id));

  // Date range display
  const startDisplay = new Date(dateStart + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const endDisplay = new Date(dateEnd + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Month label for table header
  const startDate = new Date(dateStart + "T00:00:00");
  const monthLabel = MONTH_NAMES[startDate.getMonth()];

  return (
    <>
      {/* Filters */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border)",
          padding: "16px 20px",
          marginBottom: 20,
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          {/* Date range */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setPage(1); }}
              style={{
                height: "var(--control-sm)",
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 13,
                color: "var(--foreground)",
              }}
            />
            <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>–</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setPage(1); }}
              style={{
                height: "var(--control-sm)",
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 13,
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Collaborator filter */}
          <select
            value={collaboratorId}
            onChange={(e) => { setCollaboratorId(e.target.value); setPage(1); }}
            style={{
              height: "var(--control-sm)",
              padding: "0 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            <option value="all">Todos</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeId}
            onChange={(e) => { setTypeId(e.target.value); setPage(1); }}
            style={{
              height: "var(--control-sm)",
              padding: "0 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            <option value="all">Todos os tipos</option>
            {trainingTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={situacao}
            onChange={(e) => { setSituacao(e.target.value); setPage(1); }}
            style={{
              height: "var(--control-sm)",
              padding: "0 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 13,
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            <option value="all">Todas</option>
            <option value="assinado">Assinado</option>
            <option value="pendente">Pendente</option>
            <option value="expirado">Expirado</option>
          </select>

          {/* Quick buttons */}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
            <button
              onClick={setThisMonth}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 12 }}
            >
              Este mês
            </button>
            <button
              onClick={setLastMonth}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 12 }}
            >
              Mês passado
            </button>
            <button
              onClick={setLast90}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 12 }}
            >
              Últimos 90 dias
            </button>
          </div>
        </div>

        {/* Active filter display */}
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted-foreground)" }}>
          Período: <strong style={{ color: "var(--foreground)" }}>{startDisplay} - {endDisplay}</strong>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Treinamentos", value: stats.total.toString(), sub: "no período" },
          { label: "Participantes", value: stats.participants.toString(), sub: "participantes únicos" },
          {
            label: "Horas ministradas",
            value: stats.totalHours % 1 === 0
              ? stats.totalHours.toString()
              : stats.totalHours.toFixed(1),
            sub: "horas totais",
          },
          { label: "Assinados", value: `${stats.signedPct}%`, sub: "do total assinados" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "18px 20px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--tinta)", lineHeight: 1.1 }}>
              {card.value}
            </div>
            <div style={{ marginTop: 4, fontSize: 11, color: "var(--muted-foreground)" }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--tinta)",
              }}
            >
              Treinamentos de {monthLabel}
            </span>
            <span
              style={{
                marginLeft: 10,
                fontSize: 12,
                color: "var(--muted-foreground)",
              }}
            >
              Clique no código para ver o histórico
            </span>
          </div>
          {selected.size > 0 && (
            <button
              onClick={() => setShowExportInfo(true)}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 12 }}
            >
              Exportar selecionados ({selected.size})
            </button>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "10px 16px", width: 36 }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                {[
                  "CÓDIGO",
                  "DATA E HORÁRIO",
                  "TIPO",
                  "INSTRUTOR",
                  "EMPRESA CLIENTE",
                  "PART.",
                  "DURAÇÃO",
                  "SITUAÇÃO",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 12px",
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
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "32px 16px",
                      textAlign: "center",
                      color: "var(--muted-foreground)",
                      fontSize: 13,
                    }}
                  >
                    Nenhum treinamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const statusInfo = getTrainingStatusInfo(t);
                  const startsAt = new Date(t.startsAt);
                  const endsAt = new Date(t.endsAt);
                  const dateStr = startsAt.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const timeStr = startsAt.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const durationH = getDurationHours(t.startsAt, t.endsAt);
                  const durationLabel =
                    durationH < 1
                      ? `${Math.round(durationH * 60)}min`
                      : durationH % 1 === 0
                        ? `${durationH}h`
                        : `${durationH.toFixed(1)}h`;

                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: selected.has(t.id) ? "var(--azul-gelo)" : undefined,
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="checkbox"
                          checked={selected.has(t.id)}
                          onChange={() => toggleSelect(t.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ padding: "12px 12px", whiteSpace: "nowrap" }}>
                        <Link
                          href={`/verificar/${t.verificationCode}`}
                          style={{
                            color: "var(--azul-eletrico)",
                            textDecoration: "none",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {t.verificationCode}
                        </Link>
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--muted-foreground)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dateStr} {timeStr}
                      </td>
                      <td style={{ padding: "12px 12px", color: "var(--azul-eletrico)", fontWeight: 500 }}>
                        {t.trainingType.name}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span
                            className="cpv-avatar"
                            style={{
                              width: 26,
                              height: 26,
                              fontSize: 10,
                              background: "var(--azul-gelo)",
                              color: "var(--azul-eletrico)",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(t.instructor.name)}
                          </span>
                          <span style={{ color: "var(--foreground)", fontSize: 13 }}>
                            {t.instructor.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px", color: "var(--foreground)" }}>
                        {t.clientCompanyName}
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          textAlign: "center",
                          color: "var(--muted-foreground)",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                        }}
                      >
                        1
                      </td>
                      <td
                        style={{
                          padding: "12px 12px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--muted-foreground)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {durationLabel}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: "var(--radius-full)",
                            border: "1px solid",
                            padding: "3px 10px",
                            whiteSpace: "nowrap",
                            color: statusInfo.color,
                            background: statusInfo.bg,
                            borderColor: statusInfo.border,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              background: "currentColor",
                              flexShrink: 0,
                            }}
                          />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Mostrando{" "}
            <strong style={{ color: "var(--foreground)" }}>
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            de <strong style={{ color: "var(--foreground)" }}>{filtered.length}</strong>
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 13, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cpv-btn cpv-btn--outline cpv-btn--sm"
              style={{ fontSize: 13, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {showExportInfo && (
        <ConfirmModal
          title="Exportar treinamentos"
          message={`A exportação de ${selected.size} treinamento${selected.size !== 1 ? "s" : ""} ainda não está disponível. Em breve você poderá baixar os dados em CSV ou PDF.`}
          confirmLabel="Entendido"
          cancelLabel=""
          variant="info"
          onConfirm={() => setShowExportInfo(false)}
          onCancel={() => setShowExportInfo(false)}
        />
      )}
    </>
  );
}
