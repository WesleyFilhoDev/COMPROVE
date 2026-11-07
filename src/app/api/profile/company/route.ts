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
  const parsed = z
    .object({
      name: z.string().min(2).max(200).optional(),
      cnpj: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .pipe(z.string().length(14, "CNPJ deve ter 14 dígitos."))
        .optional(),
      segment: z.string().max(100).optional().nullable(),
      zipCode: z.string().max(8).optional().nullable(),
      street: z.string().max(200).optional().nullable(),
      number: z.string().max(20).optional().nullable(),
      complement: z.string().max(100).optional().nullable(),
      district: z.string().max(100).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      state: z.string().max(2).optional().nullable(),
    })
    .refine(
      (d) =>
        d.name !== undefined ||
        d.cnpj !== undefined ||
        d.segment !== undefined ||
        d.zipCode !== undefined ||
        d.street !== undefined ||
        d.number !== undefined ||
        d.complement !== undefined ||
        d.district !== undefined ||
        d.city !== undefined ||
        d.state !== undefined,
      { message: "Nenhum campo fornecido." },
    )
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const company = await db.company.findUnique({
    where: { id: user.companyId },
    select: { nameChangedAt: true },
  });

  // Cooldown só se estiver alterando o nome
  if (parsed.data.name && company?.nameChangedAt) {
    const elapsed = Date.now() - company.nameChangedAt.getTime();
    if (elapsed < COOLDOWN_DAYS * 86_400_000) return cooldownError(company.nameChangedAt);
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) {
    updateData.name = parsed.data.name;
    updateData.nameChangedAt = new Date();
  }
  if (parsed.data.cnpj !== undefined) updateData.cnpj = parsed.data.cnpj;
  if (parsed.data.segment !== undefined) updateData.segment = parsed.data.segment;
  if (parsed.data.zipCode !== undefined) updateData.zipCode = parsed.data.zipCode?.replace(/\D/g, "") || null;
  if (parsed.data.street !== undefined) updateData.street = parsed.data.street;
  if (parsed.data.number !== undefined) updateData.number = parsed.data.number;
  if (parsed.data.complement !== undefined) updateData.complement = parsed.data.complement;
  if (parsed.data.district !== undefined) updateData.district = parsed.data.district;
  if (parsed.data.city !== undefined) updateData.city = parsed.data.city;
  if (parsed.data.state !== undefined) updateData.state = parsed.data.state;

  const updated = await db.company.update({
    where: { id: user.companyId },
    data: updateData,
    select: {
      id: true, name: true, cnpj: true, nameChangedAt: true,
      segment: true, zipCode: true, street: true, number: true,
      complement: true, district: true, city: true, state: true,
    },
  });

  return NextResponse.json({ company: updated });
}
