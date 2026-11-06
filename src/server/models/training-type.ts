import type { TenantDb } from "@/server/db/tenant";

/** List active (non-archived) training types, ordered by name. */
export async function listTrainingTypes(tenantDb: TenantDb) {
  return tenantDb.trainingType.findMany({
    where: { archivedAt: null },
    orderBy: { name: "asc" },
  });
}

/** List all training types including archived (for training form select). */
export async function listAllTrainingTypes(tenantDb: TenantDb) {
  return tenantDb.trainingType.findMany({
    orderBy: { name: "asc" },
  });
}

/** Find a single training type by id. */
export async function findTrainingTypeById(tenantDb: TenantDb, id: string) {
  return tenantDb.trainingType.findFirst({
    where: { id },
  });
}

/** Create a new training type. */
export async function createTrainingType(
  tenantDb: TenantDb,
  data: { name: string; description?: string },
) {
  return tenantDb.trainingType.create({
    data: data as typeof data & { companyId: string },
  });
}

/** Update an existing training type. */
export async function updateTrainingType(
  tenantDb: TenantDb,
  id: string,
  data: { name?: string; description?: string },
) {
  return tenantDb.trainingType.update({
    where: { id },
    data,
  });
}

/** Soft-delete a training type by setting archivedAt. */
export async function archiveTrainingType(tenantDb: TenantDb, id: string) {
  return tenantDb.trainingType.update({
    where: { id },
    data: { archivedAt: new Date() },
  });
}
