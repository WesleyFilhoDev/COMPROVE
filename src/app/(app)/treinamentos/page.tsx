export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { listTrainings } from "@/server/models/training";
import { listTrainingTypes } from "@/server/models/training-type";
import type { UserRole } from "@/generated/prisma/client";
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: "var(--font-display)", color: "var(--tinta)" }}
        >
          Treinamentos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Emita e gerencie os certificados de treinamento da empresa.
        </p>
      </div>

      <TreinamentosClient
        initialTrainings={serializedTrainings}
        trainingTypes={serializedTypes}
        collaborators={collaborators}
        isAdmin={user.role === "ADMIN"}
      />
    </main>
  );
}
