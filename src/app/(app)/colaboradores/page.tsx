import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
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

  // Fetch collaborators (users in this company with COLLABORATOR role)
  const collaborators = await db.user.findMany({
    where: { companyId: user.companyId, role: "COLLABORATOR" },
    select: { id: true, name: true, email: true, jobTitle: true },
    orderBy: { name: "asc" },
  });

  // Fetch invitations
  const invitations = await listInvitations(db);

  // Serialize for client component (Dates → strings)
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
        >
          Colaboradores
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Gerencie os membros da equipe e os convites pendentes.
        </p>
      </div>

      <ColaboradoresClient
        collaborators={collaborators}
        invitations={serializedInvitations}
      />
    </main>
  );
}
