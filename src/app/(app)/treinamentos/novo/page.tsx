export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { listTrainingTypes } from "@/server/models/training-type";
import { findCompanyById } from "@/server/models/company";
import type { UserRole } from "@/generated/prisma/client";
import { NovoTreinamentoClient } from "./novo-treinamento-client";

export default async function NovoTreinamentoPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (!user.companyId || (user.role !== "ADMIN" && user.role !== "COLLABORATOR")) {
    redirect("/dashboard");
  }

  const db = tenantDb(user.companyId);
  const company = await findCompanyById(user.companyId);
  const companyName = company?.name ?? "Minha empresa";

  const trainingTypes = await listTrainingTypes(db);

  const serializedTypes = trainingTypes.map((tt) => ({ id: tt.id, name: tt.name }));

  return (
    <NovoTreinamentoClient
      companyName={companyName}
      trainingTypes={serializedTypes}
      instructorId={user.id}
    />
  );
}
