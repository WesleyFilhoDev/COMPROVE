export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import type { UserRole } from "@/generated/prisma/client";
import { PerfilClient } from "./perfil-client";

export default async function PerfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (!user.companyId) redirect("/login");

  const [dbUser, company] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, nameChangedAt: true, jobTitle: true, image: true },
    }),
    db.company.findUnique({
      where: { id: user.companyId },
      select: { id: true, name: true, cnpj: true, nameChangedAt: true },
    }),
  ]);

  if (!dbUser || !company) redirect("/login");

  return (
    <PerfilClient
      user={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        nameChangedAt: dbUser.nameChangedAt?.toISOString() ?? null,
        role: user.role,
        jobTitle: dbUser.jobTitle ?? null,
        image: dbUser.image ?? null,
      }}
      company={{
        id: company.id,
        name: company.name,
        cnpj: company.cnpj ?? null,
        nameChangedAt: company.nameChangedAt?.toISOString() ?? null,
      }}
    />
  );
}
