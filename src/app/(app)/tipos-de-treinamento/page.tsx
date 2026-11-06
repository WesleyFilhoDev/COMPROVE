export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
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
  const rawTypes = await listAllTrainingTypes(db);

  const types = rawTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    archivedAt: t.archivedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
        >
          Tipos de Treinamento
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Gerencie os tipos de treinamento disponíveis para a sua empresa.
        </p>
      </div>

      <TiposClient initialTypes={types} />
    </main>
  );
}
