import { db } from "@/server/db/client";
import type { CompanyCreate } from "@/server/validators/company";

export async function findCompanyById(id: string) {
  return db.company.findUnique({ where: { id } });
}

export async function findCompanyByCnpj(cnpj: string) {
  return db.company.findUnique({ where: { cnpj } });
}

export async function createCompany(
  data: Omit<CompanyCreate, "recaptchaToken">,
) {
  return db.company.create({ data });
}
