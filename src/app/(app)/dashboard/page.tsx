export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import type { UserRole } from "@/generated/prisma/client";
import { DashboardClient } from "./dashboard-client";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1a5 5 0 0 1 5 5v2.5l1 1.5H2l1-1.5V6a5 5 0 0 1 5-5ZM6.5 13a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ display: "inline" }}>
      <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ display: "inline" }}>
      <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (!user.companyId || (user.role !== "ADMIN" && user.role !== "COLLABORATOR")) {
    redirect("/login");
  }

  const db = tenantDb(user.companyId);
  const company = await findCompanyById(user.companyId);
  const companyName = company?.name ?? "Minha empresa";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = MONTH_NAMES[month];

  const thisMonthStart = new Date(year, month, 1);
  const thisMonthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [
    activeCollaboratorsCount,
    pendingInvitesCount,
    trainingsThisMonth,
    trainingsLastMonthCount,
    activeTrainingTypesCount,
    recentTrainings,
    pendingInvitations,
    awaitingSignatureTrainings,
  ] = await Promise.all([
    db.user.count({
      where: {
        companyId: user.companyId,
        role: { in: ["ADMIN", "COLLABORATOR"] },
        deactivatedAt: null,
      },
    }),
    db.invitation.count({
      where: {
        companyId: user.companyId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    }),
    db.training.findMany({
      where: {
        companyId: user.companyId,
        startsAt: { gte: thisMonthStart, lte: thisMonthEnd },
      },
      select: { instructorId: true, instructorNameSnapshot: true },
    }),
    db.training.count({
      where: {
        companyId: user.companyId,
        startsAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    db.trainingType.count({
      where: { companyId: user.companyId, archivedAt: null },
    }),
    db.training.findMany({
      where: { companyId: user.companyId },
      include: {
        instructor: { select: { id: true, name: true, jobTitle: true } },
        trainingType: { select: { id: true, name: true } },
        signatures: { select: { signerRole: true, status: true } },
      },
      orderBy: { startsAt: "desc" },
      take: 5,
    }),
    db.invitation.findMany({
      where: {
        companyId: user.companyId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.training.findMany({
      where: {
        companyId: user.companyId,
        status: "ISSUED",
        signatures: { some: { status: "PENDING" } },
      },
      select: { id: true },
    }),
  ]);

  // Compute trainings by instructor this month
  const instructorMap = new Map<string, { name: string; count: number }>();
  for (const t of trainingsThisMonth) {
    const existing = instructorMap.get(t.instructorId);
    if (existing) {
      existing.count++;
    } else {
      instructorMap.set(t.instructorId, { name: t.instructorNameSnapshot, count: 1 });
    }
  }
  const trainingsByInstructor = Array.from(instructorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const trainingsThisMonthCount = trainingsThisMonth.length;
  const awaitingSignatureCount = awaitingSignatureTrainings.length;

  // Calculate % change from last month
  let pctChange: number | null = null;
  if (trainingsLastMonthCount > 0) {
    pctChange = Math.round(((trainingsThisMonthCount - trainingsLastMonthCount) / trainingsLastMonthCount) * 100);
  }

  const prevMonthName = MONTH_NAMES[month === 0 ? 11 : month - 1];

  // Serialize data for client component
  const serializedRecentTrainings = recentTrainings.map((t) => ({
    id: t.id,
    verificationCode: t.verificationCode,
    status: t.status,
    startsAt: t.startsAt.toISOString(),
    endsAt: t.endsAt.toISOString(),
    traineeName: t.traineeName,
    clientCompanyName: t.clientCompanyName,
    instructor: t.instructor,
    trainingType: t.trainingType,
    signatures: t.signatures.map((s) => ({ signerRole: s.signerRole, status: s.status })),
  }));

  const serializedPendingInvites = pendingInvitations.map((inv) => ({
    id: inv.id,
    name: inv.name,
    phone: inv.phone,
    createdAt: inv.createdAt.toISOString(),
  }));

  return (
    <div style={{ padding: "0" }}>
      {/* Top bar */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Link
            href="/dashboard"
            style={{ color: "var(--muted-foreground)", textDecoration: "none", fontWeight: 500 }}
          >
            {companyName}
          </Link>
          <span style={{ color: "var(--border)" }}>/</span>
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Painel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
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
            <BellIcon />
          </button>
          <Link href="/treinamentos" className="cpv-btn cpv-btn--primary cpv-btn--sm">
            <PlusIcon />
            Novo treinamento
          </Link>
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>
        {/* Greeting row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 24,
                color: "var(--tinta)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Olá, {getFirstName(user.name ?? "Usuário")} 👋
            </h1>
            <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>
              Resumo da {companyName} em {monthName} de {year}.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Período</span>
              <select
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
                <option>Este mês</option>
                <option>Mês passado</option>
                <option>Últimos 90 dias</option>
              </select>
            </div>
            <Link href="/colaboradores" className="cpv-btn cpv-btn--outline cpv-btn--sm">
              Convidar colaborador
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {/* Card 1: Colaboradores ativos */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Colaboradores ativos
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--tinta)", lineHeight: 1.1 }}>
              {activeCollaboratorsCount}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted-foreground)" }}>
              {pendingInvitesCount} convite{pendingInvitesCount !== 1 ? "s" : ""} pendente{pendingInvitesCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Card 2: Treinamentos este mês */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Treinamentos em {monthName}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--tinta)", lineHeight: 1.1 }}>
              {trainingsThisMonthCount}
            </div>
            {pctChange !== null && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: pctChange >= 0 ? "var(--success)" : "var(--destructive)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {pctChange >= 0 ? <UpArrowIcon /> : <DownArrowIcon />}
                {Math.abs(pctChange)}% vs. {prevMonthName}
              </div>
            )}
            {pctChange === null && (
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted-foreground)" }}>
                primeiro mês de dados
              </div>
            )}
          </div>

          {/* Card 3: Aguardando assinatura */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Aguardando assinatura
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--tinta)", lineHeight: 1.1 }}>
              {awaitingSignatureCount}
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--warning)",
                  background: "var(--warning-soft)",
                  border: "1px solid var(--warning-border)",
                  borderRadius: "var(--radius-full)",
                  padding: "2px 8px",
                }}
              >
                Pendente
              </span>
            </div>
          </div>

          {/* Card 4: Tipos de treinamento */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Tipos de treinamento
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--tinta)", lineHeight: 1.1 }}>
              {activeTrainingTypesCount}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted-foreground)" }}>
              ativos para lançamento
            </div>
          </div>
        </div>

        {/* Shortcuts section */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: 12,
            }}
          >
            ATALHOS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                title: "Novo treinamento",
                desc: "Registrar e gerar comprovante",
                href: "/treinamentos",
                iconBg: "var(--azul-gelo)",
                iconColor: "var(--azul-eletrico)",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M6 9.5h4M8 7.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Convidar colaborador",
                desc: "Link de convite pelo WhatsApp",
                href: "/colaboradores",
                iconBg: "var(--success-soft)",
                iconColor: "var(--success)",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M1 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "Novo tipo de treinamento",
                desc: "Liberar um novo conteúdo",
                href: "/tipos-de-treinamento",
                iconBg: "var(--warning-soft)",
                iconColor: "var(--warning)",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0L2.293 8.293A1 1 0 0 1 2 7.586V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                  </svg>
                ),
              },
              {
                title: "Relatório do mês",
                desc: "Exportar em PDF ou CSV",
                href: "/relatorios",
                iconBg: "var(--info-soft)",
                iconColor: "var(--info)",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="6.5" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="12" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
              },
            ].map((shortcut) => (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                style={{
                  background: "var(--card)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  textDecoration: "none",
                  transition: "box-shadow 0.15s, transform 0.1s",
                  boxShadow: "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-lg)",
                    background: shortcut.iconBg,
                    color: shortcut.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {shortcut.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.3 }}>
                    {shortcut.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                    {shortcut.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two-column section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {/* Trainings by instructor */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--tinta)",
                margin: "0 0 16px",
              }}
            >
              Treinamentos por colaborador
            </h2>
            {trainingsByInstructor.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                Nenhum treinamento este mês.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {trainingsByInstructor.map((item, idx) => {
                  const maxCount = trainingsByInstructor[0].count;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--azul-eletrico)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {item.count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 4,
                          background: "var(--nevoa)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "var(--azul-eletrico)",
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div
              style={{
                marginTop: 16,
                fontSize: 12,
                color: "var(--muted-foreground)",
                borderTop: "1px solid var(--border)",
                paddingTop: 12,
              }}
            >
              {trainingsThisMonthCount} treinamento{trainingsThisMonthCount !== 1 ? "s" : ""} no total
              {" · "}
              {trainingsByInstructor.length} instrutor{trainingsByInstructor.length !== 1 ? "es" : ""}
            </div>
          </div>

          {/* Pending invitations */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              boxShadow: "var(--shadow-xs)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--tinta)",
                  margin: 0,
                }}
              >
                Convites pendentes
              </h2>
              <Link
                href="/colaboradores"
                style={{
                  fontSize: 12,
                  color: "var(--azul-eletrico)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Ver todos
              </Link>
            </div>
            {serializedPendingInvites.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                Nenhum convite pendente.
              </p>
            ) : (
              <DashboardClient pendingInvites={serializedPendingInvites} />
            )}
          </div>
        </div>

        {/* Recent trainings table */}
        <div
          style={{
            background: "var(--card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-xs)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--tinta)",
                margin: 0,
              }}
            >
              Últimos treinamentos
            </h2>
            <Link
              href="/relatorios"
              style={{
                fontSize: 12,
                color: "var(--azul-eletrico)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Ver todos em Relatórios
            </Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["CÓDIGO", "TIPO", "CLIENTE", "INSTRUTOR", "DATA E HORÁRIO", "SITUAÇÃO"].map(
                    (col) => (
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {serializedRecentTrainings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "24px 16px",
                        textAlign: "center",
                        color: "var(--muted-foreground)",
                        fontSize: 13,
                      }}
                    >
                      Nenhum treinamento ainda.
                    </td>
                  </tr>
                ) : (
                  serializedRecentTrainings.map((t) => {
                    const sigTotal = t.signatures.length;
                    const sigSigned = t.signatures.filter((s) => s.status === "SIGNED").length;
                    const isFullySigned = t.status === "ISSUED" && sigTotal > 0 && sigSigned === sigTotal;
                    const isCanceled = t.status === "CANCELED";
                    const isPending = t.status === "ISSUED" && sigSigned < sigTotal;

                    const badgeStyle: React.CSSProperties = isFullySigned
                      ? { color: "var(--success)", background: "var(--success-soft)", borderColor: "var(--success-border)" }
                      : isCanceled
                        ? { color: "var(--destructive)", background: "var(--destructive-soft)", borderColor: "var(--destructive-border)" }
                        : { color: "var(--warning)", background: "var(--warning-soft)", borderColor: "var(--warning-border)" };

                    const badgeLabel = isFullySigned
                      ? "Assinado"
                      : isCanceled
                        ? "Expirado"
                        : sigTotal > 0
                          ? `Pendente — ${sigSigned} de ${sigTotal}`
                          : "Pendente";

                    const startsAt = new Date(t.startsAt);
                    const dateStr = startsAt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const timeStr = startsAt.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={t.id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <Link
                            href={`/verificar/${t.verificationCode}`}
                            style={{
                              color: "var(--azul-eletrico)",
                              textDecoration: "none",
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {t.verificationCode}
                          </Link>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: "var(--azul-eletrico)", fontWeight: 500 }}>
                            {t.trainingType.name}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--foreground)" }}>
                          {t.clientCompanyName}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--foreground)" }}>
                          {t.instructor.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dateStr} {timeStr}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
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
                              ...badgeStyle,
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
                            {badgeLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
