export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { tenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import type { UserRole } from "@/generated/prisma/client";
import { TrainamentoDetail } from "./treinamento-detail-client";
import { maskCpf } from "@/lib/format";

export default async function TrainamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const training = await db.training.findFirst({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, jobTitle: true } },
      trainingType: { select: { id: true, name: true } },
      signatures: {
        select: {
          id: true,
          signerRole: true,
          signerName: true,
          status: true,
          signedAt: true,
          signToken: true,
        },
      },
      canceledBy: { select: { id: true, name: true } },
    },
  });

  if (!training) notFound();

  const instructorSig = training.signatures.find((s) => s.signerRole === "INSTRUCTOR") ?? null;
  const traineeSig = training.signatures.find((s) => s.signerRole === "TRAINEE") ?? null;

  const durationMs = training.endsAt.getTime() - training.startsAt.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const durationLabel = Number.isInteger(durationHours)
    ? `${durationHours}h`
    : `${durationHours.toFixed(1)}h`;

  return (
    <TrainamentoDetail
      companyName={companyName}
      isAdmin={user.role === "ADMIN"}
      currentUserId={user.id}
      training={{
        id: training.id,
        status: training.status,
        verificationCode: training.verificationCode,
        startsAt: training.startsAt.toISOString(),
        endsAt: training.endsAt.toISOString(),
        durationLabel,
        traineeName: training.traineeName,
        traineeCpf: maskCpf(training.traineeCpf),
        traineePhone: training.traineePhone ?? null,
        clientCompanyName: training.clientCompanyName,
        contentMinistrado: training.contentMinistrado ?? null,
        canceledAt: training.canceledAt?.toISOString() ?? null,
        cancelReason: training.cancelReason ?? null,
        createdAt: training.createdAt.toISOString(),
        instructor: training.instructor,
        trainingType: training.trainingType,
        canceledBy: training.canceledBy ?? null,
      }}
      instructorSig={
        instructorSig
          ? {
              status: instructorSig.status,
              signerName: instructorSig.signerName,
              signedAt: instructorSig.signedAt?.toISOString() ?? null,
              signToken: instructorSig.signToken ?? null,
            }
          : null
      }
      traineeSig={
        traineeSig
          ? {
              status: traineeSig.status,
              signerName: traineeSig.signerName,
              signedAt: traineeSig.signedAt?.toISOString() ?? null,
              signToken: traineeSig.signToken ?? null,
            }
          : null
      }
    />
  );
}
