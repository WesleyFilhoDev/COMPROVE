export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import type { UserRole } from "@/generated/prisma/client";
import { ConfiguracoesClient } from "./configuracoes-client";

export default async function ConfiguracoesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (user.role !== "ADMIN" || !user.companyId) {
    redirect("/dashboard");
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    select: {
      id: true,
      name: true,
      cnpj: true,
      nameChangedAt: true,
      segment: true,
      zipCode: true,
      street: true,
      number: true,
      complement: true,
      district: true,
      city: true,
      state: true,
    },
  });

  if (!company) redirect("/login");

  return (
    <ConfiguracoesClient
      company={{
        id: company.id,
        name: company.name,
        cnpj: company.cnpj ?? null,
        nameChangedAt: company.nameChangedAt?.toISOString() ?? null,
        segment: company.segment ?? null,
        zipCode: company.zipCode ?? null,
        street: company.street ?? null,
        number: company.number ?? null,
        complement: company.complement ?? null,
        district: company.district ?? null,
        city: company.city ?? null,
        state: company.state ?? null,
      }}
    />
  );
}
