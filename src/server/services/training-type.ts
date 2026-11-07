import type { TenantDb } from "@/server/db/tenant";
import {
  createTrainingType as modelCreate,
  updateTrainingType as modelUpdate,
  archiveTrainingType as modelArchive,
  findTrainingTypeById,
} from "@/server/models/training-type";
import type { TrainingTypeCreate, TrainingTypeUpdate } from "@/server/validators/training-type";

export class TrainingTypeError extends Error {
  constructor(
    message: string,
    public readonly code: "NAME_TAKEN" | "NOT_FOUND" | "HAS_TRAININGS",
  ) {
    super(message);
    this.name = "TrainingTypeError";
  }
}

/** Check if a name is already taken within the tenant (optionally excluding a specific id). */
async function isNameTaken(
  tenantDb: TenantDb,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await tenantDb.trainingType.findFirst({
    where: {
      name,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

export async function createTrainingType(
  _userId: string,
  _companyId: string,
  tenantDb: TenantDb,
  data: TrainingTypeCreate,
) {
  if (await isNameTaken(tenantDb, data.name)) {
    throw new TrainingTypeError(
      `Já existe um tipo de treinamento com o nome "${data.name}".`,
      "NAME_TAKEN",
    );
  }

  return modelCreate(tenantDb, data);
}

export async function updateTrainingType(
  _userId: string,
  _companyId: string,
  tenantDb: TenantDb,
  id: string,
  data: TrainingTypeUpdate,
) {
  const existing = await findTrainingTypeById(tenantDb, id);
  if (!existing) {
    throw new TrainingTypeError("Tipo de treinamento não encontrado.", "NOT_FOUND");
  }

  if (data.name && data.name !== existing.name) {
    if (await isNameTaken(tenantDb, data.name, id)) {
      throw new TrainingTypeError(
        `Já existe um tipo de treinamento com o nome "${data.name}".`,
        "NAME_TAKEN",
      );
    }
  }

  // Map archivedAt string to Date or null
  const updateData: Parameters<typeof modelUpdate>[2] = {
    name: data.name,
    description: data.description,
    defaultDurationHours: data.defaultDurationHours,
    declarationText: data.declarationText,
  };

  if ("archivedAt" in data) {
    updateData.archivedAt = data.archivedAt ? new Date(data.archivedAt) : null;
  }

  return modelUpdate(tenantDb, id, updateData);
}

export async function archiveTrainingType(
  _userId: string,
  _companyId: string,
  tenantDb: TenantDb,
  id: string,
) {
  const existing = await findTrainingTypeById(tenantDb, id);
  if (!existing) {
    throw new TrainingTypeError("Tipo de treinamento não encontrado.", "NOT_FOUND");
  }

  return modelArchive(tenantDb, id);
}
