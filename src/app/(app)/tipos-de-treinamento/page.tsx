export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import { listAllTrainingTypes } from "@/server/models/training-type";
import type { UserRole } from "@/generated/prisma/client";
import { TiposClient } from "./tipos-client";

export default async function TiposDeTreinamentoPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (!user.companyId || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const db = tenantDb(user.companyId);
  const company = await findCompanyById(user.companyId);
  const companyName = company?.name ?? "Minha empresa";

  const rawTypes = await listAllTrainingTypes(db);

  // Usage count per type
  const usageGroups = await db.training.groupBy({
    by: ["trainingTypeId"],
    where: { companyId: user.companyId },
    _count: { id: true },
  });

  const usageByType = new Map<string, number>(
    usageGroups.map((g) => [g.trainingTypeId, g._count.id]),
  );

  const types = rawTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    defaultDurationHours: t.defaultDurationHours,
    declarationText: t.declarationText,
    archivedAt: t.archivedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    usageCount: usageByType.get(t.id) ?? 0,
  }));

  return (
    <TiposClient
      companyName={companyName}
      initialTypes={types}
    />
  );
}
