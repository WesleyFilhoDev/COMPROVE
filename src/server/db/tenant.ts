import { db } from "./client";

const TENANT_MODELS = new Set(["Invitation", "TrainingType", "Training", "Signature"]);

type Args = Record<string, unknown>;

export function tenantDb(companyId: string) {
  return db.$extends({
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.has(model)) return query(args);

          const a = args as Args;

          if (operation === "create") {
            return query({ ...a, data: { ...(a.data as Args), companyId } } as typeof args);
          }

          if (operation === "createMany") {
            const rows = Array.isArray(a.data)
              ? (a.data as Args[]).map((row) => ({ ...row, companyId }))
              : { ...(a.data as Args), companyId };
            return query({ ...a, data: rows } as typeof args);
          }

          if (operation === "upsert") {
            return query({
              ...a,
              where: { ...(a.where as Args), companyId },
              create: { ...(a.create as Args), companyId },
            } as typeof args);
          }

          return query({ ...a, where: { ...(a.where as Args), companyId } } as typeof args);
        },
      },
    },
  });
}

export type TenantDb = ReturnType<typeof tenantDb>;
