export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import { listInvitations } from "@/server/models/invitation";
import type { UserRole } from "@/generated/prisma/client";
import { ColaboradoresClient } from "./colaboradores-client";

export default async function ColaboradoresPage() {
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

  // Fetch collaborators (users in this company with COLLABORATOR role)
  const collaborators = await db.user.findMany({
    where: { companyId: user.companyId, role: "COLLABORATOR" },
    select: { id: true, name: true, email: true, jobTitle: true, deactivatedAt: true },
    orderBy: { name: "asc" },
  });

  // Fetch invitations
  const invitations = await listInvitations(db);

  // Trainings count per user this month
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const trainingGroups = await db.training.groupBy({
    by: ["instructorId"],
    where: {
      companyId: user.companyId,
      startsAt: { gte: thisMonthStart, lte: thisMonthEnd },
    },
    _count: { id: true },
  });

  const trainingCountByUser = new Map<string, number>(
    trainingGroups.map((g) => [g.instructorId, g._count.id]),
  );

  // Last session per collaborator
  const collaboratorIds = collaborators.map((c) => c.id);
  const sessions = collaboratorIds.length > 0
    ? await db.session.findMany({
        where: { userId: { in: collaboratorIds } },
        orderBy: { createdAt: "desc" },
        select: { userId: true, createdAt: true },
      })
    : [];

  const lastAccessByUser = new Map<string, Date>();
  for (const s of sessions) {
    if (!lastAccessByUser.has(s.userId)) {
      lastAccessByUser.set(s.userId, s.createdAt);
    }
  }

  const activeCollaborators = collaborators
    .filter((c) => !c.deactivatedAt)
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      jobTitle: c.jobTitle,
      trainingsThisMonth: trainingCountByUser.get(c.id) ?? 0,
      lastAccess: lastAccessByUser.get(c.id)?.toISOString() ?? null,
    }));

  const inactiveCollaborators = collaborators
    .filter((c) => !!c.deactivatedAt)
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      jobTitle: c.jobTitle,
      trainingsThisMonth: trainingCountByUser.get(c.id) ?? 0,
      lastAccess: lastAccessByUser.get(c.id)?.toISOString() ?? null,
    }));

  // Serialize invitations
  const serializedInvitations = invitations.map((inv) => ({
    id: inv.id,
    name: inv.name,
    jobTitle: inv.jobTitle,
    phone: inv.phone,
    acceptedAt: inv.acceptedAt?.toISOString() ?? null,
    revokedAt: inv.revokedAt?.toISOString() ?? null,
    expiresAt: inv.expiresAt.toISOString(),
    createdAt: inv.createdAt.toISOString(),
    invitedBy: { name: inv.invitedBy.name },
  }));

  return (
    <ColaboradoresClient
      companyName={companyName}
      activeCollaborators={activeCollaborators}
      inactiveCollaborators={inactiveCollaborators}
      invitations={serializedInvitations}
    />
  );
}
