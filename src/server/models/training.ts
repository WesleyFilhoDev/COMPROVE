import { db } from "@/server/db/client";
import type { TenantDb } from "@/server/db/tenant";
import type { TrainingStatus } from "@/generated/prisma/client";

export type TrainingFilters = {
  status?: TrainingStatus;
  instructorId?: string;
  trainingTypeId?: string;
};

const trainingInclude = {
  instructor: { select: { id: true, name: true, jobTitle: true } },
  trainingType: { select: { id: true, name: true } },
  signatures: { select: { signerRole: true, status: true, signedAt: true } },
} as const;

/** List trainings for a tenant with optional filters, ordered by startsAt desc. */
export async function listTrainings(tenantDb: TenantDb, filters?: TrainingFilters) {
  return tenantDb.training.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.instructorId ? { instructorId: filters.instructorId } : {}),
      ...(filters?.trainingTypeId ? { trainingTypeId: filters.trainingTypeId } : {}),
    },
    include: trainingInclude,
    orderBy: { startsAt: "desc" },
  });
}

/** Find a training by its verification code (global — uses raw db). */
export async function findTrainingByCode(code: string) {
  return db.training.findUnique({
    where: { verificationCode: code },
    include: {
      company: { select: { id: true, name: true, cnpj: true } },
      trainingType: { select: { id: true, name: true } },
      instructor: { select: { id: true, name: true, jobTitle: true } },
    },
  });
}

/** Find a training by id within a tenant. */
export async function findTrainingById(tenantDb: TenantDb, id: string) {
  return tenantDb.training.findFirst({
    where: { id },
    include: trainingInclude,
  });
}

/** Create a new training record. */
export async function createTraining(
  tenantDb: TenantDb,
  data: {
    instructorId: string;
    trainingTypeId: string;
    startsAt: Date;
    endsAt: Date;
    traineeName: string;
    traineeCpf: string;
    clientCompanyName: string;
    instructorNameSnapshot: string;
    instructorJobTitleSnapshot: string;
    trainingTypeNameSnapshot: string;
    declarationTextSnapshot?: string | null;
    companyNameSnapshot: string;
    companyCnpjSnapshot: string;
    verificationCode: string;
    contentHash: string;
    templateVersion: number;
    traineePhone?: string | null;
    contentMinistrado?: string | null;
  },
) {
  return tenantDb.training.create({
    data: data as typeof data & { companyId: string },
    include: trainingInclude,
  });
}

/** Cancel a training by updating its status. */
export async function cancelTraining(
  tenantDb: TenantDb,
  id: string,
  canceledById: string,
  reason: string,
) {
  return tenantDb.training.update({
    where: { id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      canceledById,
      cancelReason: reason,
    },
    include: trainingInclude,
  });
}
