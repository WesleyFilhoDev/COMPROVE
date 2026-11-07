import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import type { UserRole } from "@/generated/prisma/client";

const COOLDOWN_DAYS = 30;

function cooldownError(changedAt: Date) {
  const nextAllowed = new Date(changedAt);
  nextAllowed.setDate(nextAllowed.getDate() + COOLDOWN_DAYS);
  const days = Math.ceil((nextAllowed.getTime() - Date.now()) / 86_400_000);
  return NextResponse.json(
    { error: `Você só pode alterar o nome da empresa novamente em ${days} dia${days !== 1 ? "s" : ""}.` },
    { status: 429 },
  );
}

// PATCH /api/profile/company → atualiza nome da empresa (ADMIN only)
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (user.role !== "ADMIN" || !user.companyId) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = z.object({ name: z.string().min(2).max(200) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    select: { nameChangedAt: true },
  });

  if (company?.nameChangedAt) {
    const elapsed = Date.now() - company.nameChangedAt.getTime();
    if (elapsed < COOLDOWN_DAYS * 86_400_000) return cooldownError(company.nameChangedAt);
  }

  const updated = await db.company.update({
    where: { id: user.companyId },
    data: { name: parsed.data.name, nameChangedAt: new Date() },
    select: { id: true, name: true, nameChangedAt: true },
  });

  return NextResponse.json({ company: updated });
}
