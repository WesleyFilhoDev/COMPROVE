import { db } from "@/server/db/client";
import { findCompanyByCnpj } from "@/server/models/company";
import type { CompanyCreate } from "@/server/validators/company";

export class CompanyError extends Error {
  constructor(
    message: string,
    public readonly code: "CNPJ_TAKEN" | "USER_HAS_COMPANY",
  ) {
    super(message);
  }
}

export async function createCompanyAndPromoteAdmin(
  userId: string,
  data: Omit<CompanyCreate, "recaptchaToken">,
) {
  const existing = await findCompanyByCnpj(data.cnpj);
  if (existing) throw new CompanyError("CNPJ já cadastrado.", "CNPJ_TAKEN");

  return db.$transaction(async (tx) => {
    const company = await tx.company.create({ data });
    await tx.user.update({
      where: { id: userId },
      data: { companyId: company.id, role: "ADMIN" },
    });
    return company;
  });
}
