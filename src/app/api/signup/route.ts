import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db/client";
import { auth } from "@/server/auth/auth";
import { toE164 } from "@/lib/format";

const schema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().min(2).max(200),
  segment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, password, phone, jobTitle, companyName, segment } = parsed.data;

  // 1. Cria o usuário via Better Auth
  let signUpRes: Awaited<ReturnType<typeof auth.api.signUpEmail>>;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signUpRes = await auth.api.signUpEmail({ body: { name, email, password } as any });
  } catch (err) {
    console.error("[signup] signUpEmail threw:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (!signUpRes?.user) {
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 400 });
  }

  // Busca o registro real pelo email (o ID retornado pelo Better Auth pode não bater)
  const dbUser = await db.user.findFirst({ where: { email } });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuário não encontrado após cadastro." }, { status: 500 });
  }
  const userId = dbUser.id;

  // 2. Cria empresa e vincula o usuário como ADMIN em uma transação
  await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: companyName, segment: segment || null },
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        companyId: company.id,
        role: "ADMIN",
        ...(phone ? { phone: toE164(phone) } : {}),
        ...(jobTitle ? { jobTitle } : {}),
      },
    });
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
