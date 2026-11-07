export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import type { UserRole } from "@/generated/prisma/client";
import { RelatoriosClient } from "./relatorios-client";

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

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M4 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default async function RelatoriosPage() {
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

  const [trainings, collaborators, trainingTypes] = await Promise.all([
    db.training.findMany({
      include: {
        instructor: { select: { id: true, name: true, jobTitle: true } },
        trainingType: { select: { id: true, name: true } },
        signatures: { select: { signerRole: true, status: true, signedAt: true } },
      },
      orderBy: { startsAt: "desc" },
    }),
    db.user.findMany({
      where: {
        companyId: user.companyId,
        role: { in: ["ADMIN", "COLLABORATOR"] },
        deactivatedAt: null,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.trainingType.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedTrainings = trainings.map((t) => ({
    id: t.id,
    verificationCode: t.verificationCode,
    status: t.status,
    startsAt: t.startsAt.toISOString(),
    endsAt: t.endsAt.toISOString(),
    traineeName: t.traineeName,
    clientCompanyName: t.clientCompanyName,
    instructor: t.instructor,
    trainingType: t.trainingType,
    signatures: t.signatures.map((s) => ({
      signerRole: s.signerRole,
      status: s.status,
      signedAt: s.signedAt?.toISOString() ?? null,
    })),
  }));

  return (
    <div>
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
          <span style={{ color: "var(--azul-eletrico)", fontWeight: 700 }}>Relatórios</span>
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
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>

        <RelatoriosClient
          trainings={serializedTrainings}
          collaborators={collaborators}
          trainingTypes={trainingTypes}
          companyName={companyName}
        />
      </div>
    </div>
  );
}
