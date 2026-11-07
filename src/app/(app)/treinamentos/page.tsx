export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { listTrainings } from "@/server/models/training";
import { listTrainingTypes } from "@/server/models/training-type";
import type { UserRole } from "@/generated/prisma/client";
import { findCompanyById } from "@/server/models/company";
import { TreinamentosClient } from "./treinamentos-client";

export default async function TreinamentosPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

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

  const [trainings, trainingTypes] = await Promise.all([
    listTrainings(db),
    listTrainingTypes(db),
  ]);

  // Fetch collaborators for instructor select
  const collaborators = await db.user.findMany({
    where: {
      companyId: user.companyId,
      role: { in: ["COLLABORATOR", "ADMIN"] },
      deactivatedAt: null,
    },
    select: { id: true, name: true, jobTitle: true },
    orderBy: { name: "asc" },
  });

  // Serialize dates for client component
  const serializedTrainings = trainings.map((t) => ({
    id: t.id,
    status: t.status,
    startsAt: t.startsAt.toISOString(),
    endsAt: t.endsAt.toISOString(),
    traineeName: t.traineeName,
    traineeCpf: t.traineeCpf,
    clientCompanyName: t.clientCompanyName,
    verificationCode: t.verificationCode,
    canceledAt: t.canceledAt?.toISOString() ?? null,
    cancelReason: t.cancelReason ?? null,
    instructor: t.instructor,
    trainingType: t.trainingType,
  }));

  const serializedTypes = trainingTypes.map((tt) => ({
    id: tt.id,
    name: tt.name,
  }));

  return (
    <TreinamentosClient
      companyName={companyName}
      initialTrainings={serializedTrainings}
      trainingTypes={serializedTypes}
      collaborators={collaborators}
      isAdmin={user.role === "ADMIN"}
    />
  );
}
