import crypto from "crypto";
import { db } from "@/server/db/client";
import type { TenantDb } from "@/server/db/tenant";
import { findCompanyById } from "@/server/models/company";
import {
  createTraining as modelCreate,
  cancelTraining as modelCancel,
  findTrainingById,
} from "@/server/models/training";
import type { TrainingCreate, TrainingUpdate, TrainingCancel } from "@/server/validators/training";
import { generateVerificationCode, computeContentHash } from "@/lib/training-hash";

type TrainingErrorCode =
  | "NOT_FOUND"
  | "COMPANY_INCOMPLETE"
  | "ALREADY_CANCELED"
  | "INVALID_DATES"
  | "INVALID_INSTRUCTOR"
  | "INVALID_TRAINING_TYPE";

export class TrainingError extends Error {
  constructor(
    message: string,
    public readonly code: TrainingErrorCode,
  ) {
    super(message);
    this.name = "TrainingError";
  }
}

type SessionUser = {
  id: string;
  name: string;
};

/**
 * Emit (create) a new training record.
 * Requires both tenantDb (scoped inserts) and raw db (global uniqueness check).
 */
export async function emitTraining(
  user: SessionUser,
  companyId: string,
  tenantDb: TenantDb,
  _rawDb: typeof db,
  data: TrainingCreate,
) {
  // 1. Validate dates
  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);
  if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
    throw new TrainingError("Datas inválidas.", "INVALID_DATES");
  }
  if (endsAt <= startsAt) {
    throw new TrainingError(
      "A data de término deve ser posterior à data de início.",
      "INVALID_DATES",
    );
  }

  // 2. Fetch and validate training type (must be active, same company)
  const trainingType = await tenantDb.trainingType.findFirst({
    where: { id: data.trainingTypeId, archivedAt: null },
  });
  if (!trainingType) {
    throw new TrainingError(
      "Tipo de treinamento não encontrado ou arquivado.",
      "INVALID_TRAINING_TYPE",
    );
  }

  // 3. Fetch and validate instructor (must have role COLLABORATOR or ADMIN, same company)
  const instructor = await tenantDb.user.findFirst({
    where: {
      id: data.instructorId,
      companyId,
      role: { in: ["COLLABORATOR", "ADMIN"] },
      deactivatedAt: null,
    },
  });
  if (!instructor) {
    throw new TrainingError(
      "Instrutor não encontrado ou sem permissão.",
      "INVALID_INSTRUCTOR",
    );
  }

  // 4. Fetch company for snapshots
  const company = await findCompanyById(companyId);
  if (!company) {
    throw new TrainingError("Empresa não encontrada.", "NOT_FOUND");
  }
  if (!company.cnpj) {
    throw new TrainingError(
      "Complete o cadastro da empresa com o CNPJ antes de emitir treinamentos.",
      "COMPANY_INCOMPLETE",
    );
  }

  // 5. Generate verification code with up to 5 retries on collision
  let verificationCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateVerificationCode();
    const existing = await db.training.findUnique({
      where: { verificationCode: candidate },
      select: { id: true },
    });
    if (!existing) {
      verificationCode = candidate;
      break;
    }
  }
  if (!verificationCode) {
    throw new Error("Não foi possível gerar um código de verificação único. Tente novamente.");
  }

  // 6. Compute content hash
  const contentHash = computeContentHash({
    traineeName: data.traineeName,
    traineeCpf: data.traineeCpf,
    clientCompanyName: data.clientCompanyName,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    instructorNameSnapshot: instructor.name,
    instructorJobTitleSnapshot: instructor.jobTitle ?? "",
    trainingTypeNameSnapshot: trainingType.name,
    companyNameSnapshot: company.name,
    companyCnpjSnapshot: company.cnpj!,
    templateVersion: 1,
  });

  // 7. Create training
  const training = await modelCreate(tenantDb, {
    instructorId: data.instructorId,
    trainingTypeId: data.trainingTypeId,
    startsAt,
    endsAt,
    traineeName: data.traineeName,
    traineeCpf: data.traineeCpf,
    clientCompanyName: data.clientCompanyName,
    instructorNameSnapshot: instructor.name,
    instructorJobTitleSnapshot: instructor.jobTitle ?? "",
    trainingTypeNameSnapshot: trainingType.name,
    companyNameSnapshot: company.name,
    companyCnpjSnapshot: company.cnpj!,
    verificationCode,
    contentHash,
    templateVersion: 1,
  });

  // 8. Create signatures (INSTRUCTOR + TRAINEE, both with sign tokens)
  const instructorToken = crypto.randomBytes(32).toString("hex");
  const traineeToken = crypto.randomBytes(32).toString("hex");
  await tenantDb.signature.createMany({
    data: [
      {
        companyId,
        trainingId: training.id,
        signerRole: "INSTRUCTOR",
        signerName: instructor.name,
        status: "PENDING",
        signToken: instructorToken,
      },
      {
        companyId,
        trainingId: training.id,
        signerRole: "TRAINEE",
        signerName: data.traineeName,
        status: "PENDING",
        signToken: traineeToken,
      },
    ],
  });

  return training;
}

type SessionUserWithCompany = { id: string; name: string; companyId: string };

/** Update an existing training, recalculating content hash. */
export async function updateTraining(
  user: SessionUserWithCompany,
  tenantDb: TenantDb,
  id: string,
  data: TrainingUpdate,
) {
  const existing = await findTrainingById(tenantDb, id);
  if (!existing) throw new TrainingError("Treinamento não encontrado.", "NOT_FOUND");
  if (existing.status === "CANCELED") {
    throw new TrainingError("Não é possível editar um treinamento cancelado.", "ALREADY_CANCELED");
  }

  const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
  const endsAt = data.endsAt ? new Date(data.endsAt) : existing.endsAt;
  if (endsAt <= startsAt) {
    throw new TrainingError("A data de término deve ser posterior à data de início.", "INVALID_DATES");
  }

  // Resolve snapshots if related records changed
  let instructorNameSnapshot = existing.instructorNameSnapshot;
  let instructorJobTitleSnapshot = existing.instructorJobTitleSnapshot;
  if (data.instructorId && data.instructorId !== existing.instructorId) {
    const instructor = await tenantDb.user.findFirst({
      where: { id: data.instructorId, companyId: user.companyId, deactivatedAt: null },
    });
    if (!instructor) throw new TrainingError("Instrutor não encontrado.", "INVALID_INSTRUCTOR");
    instructorNameSnapshot = instructor.name;
    instructorJobTitleSnapshot = instructor.jobTitle ?? "";
  }

  let trainingTypeNameSnapshot = existing.trainingTypeNameSnapshot;
  if (data.trainingTypeId && data.trainingTypeId !== existing.trainingTypeId) {
    const type = await tenantDb.trainingType.findFirst({
      where: { id: data.trainingTypeId, archivedAt: null },
    });
    if (!type) throw new TrainingError("Tipo de treinamento não encontrado.", "INVALID_TRAINING_TYPE");
    trainingTypeNameSnapshot = type.name;
  }

  const traineeName = data.traineeName ?? existing.traineeName;
  const traineeCpf = data.traineeCpf ?? existing.traineeCpf;
  const clientCompanyName = data.clientCompanyName ?? existing.clientCompanyName;

  const contentHash = computeContentHash({
    traineeName,
    traineeCpf,
    clientCompanyName,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    instructorNameSnapshot,
    instructorJobTitleSnapshot,
    trainingTypeNameSnapshot,
    companyNameSnapshot: existing.companyNameSnapshot,
    companyCnpjSnapshot: existing.companyCnpjSnapshot,
    templateVersion: existing.templateVersion,
  });

  return tenantDb.training.update({
    where: { id },
    data: {
      ...(data.trainingTypeId ? { trainingTypeId: data.trainingTypeId, trainingTypeNameSnapshot } : {}),
      ...(data.instructorId ? { instructorId: data.instructorId, instructorNameSnapshot, instructorJobTitleSnapshot } : {}),
      startsAt,
      endsAt,
      traineeName,
      traineeCpf,
      clientCompanyName,
      contentHash,
    },
    include: {
      instructor: { select: { id: true, name: true, jobTitle: true } },
      trainingType: { select: { id: true, name: true } },
      signatures: { select: { signerRole: true, status: true, signedAt: true } },
    },
  });
}

/** Cancel an existing training. */
export async function cancelTraining(
  user: SessionUser,
  tenantDb: TenantDb,
  id: string,
  reason: TrainingCancel["reason"],
) {
  const existing = await findTrainingById(tenantDb, id);
  if (!existing) {
    throw new TrainingError("Treinamento não encontrado.", "NOT_FOUND");
  }
  if (existing.status === "CANCELED") {
    throw new TrainingError("Este treinamento já foi cancelado.", "ALREADY_CANCELED");
  }

  return modelCancel(tenantDb, id, user.id, reason);
}
