/**
 * Script para criar um colaborador/instrutor de teste diretamente no banco.
 * Uso: npx tsx prisma/seed-collaborator.ts
 *
 * Variáveis de ambiente necessárias no .env:
 *   DATABASE_URL, ADMIN_EMAIL (e-mail do gestor para buscar a empresa)
 *
 * Variáveis opcionais (ou edite os valores padrão abaixo):
 *   COLLAB_EMAIL, COLLAB_PASSWORD, COLLAB_NAME, COLLAB_JOB_TITLE
 */
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Variável ${name} não definida.`);
  return v;
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const adminEmail = requireEnv("MASTER_EMAIL"); // usa o e-mail do gestor master para achar a empresa

  // Dados do colaborador de teste (pode sobrescrever via env ou editar aqui)
  const collabEmail = (process.env.COLLAB_EMAIL ?? "instrutor@teste.com").toLowerCase();
  const collabPassword = process.env.COLLAB_PASSWORD ?? "Teste@12345";
  const collabName = process.env.COLLAB_NAME ?? "Instrutor Teste";
  const collabJobTitle = process.env.COLLAB_JOB_TITLE ?? "Instrutor de Segurança";

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: databaseUrl }),
  });

  try {
    // Busca o admin para pegar o companyId
    const admin = await prisma.user.findFirst({
      where: { email: adminEmail, role: { in: ["ADMIN", "MASTER"] } },
      select: { id: true, companyId: true, name: true },
    });

    if (!admin) throw new Error(`Admin ${adminEmail} não encontrado ou sem role ADMIN/MASTER.`);

    // Tenta encontrar uma empresa ligada ao admin (pode ser via companyId ou via Company.users)
    let companyId = admin.companyId;
    if (!companyId) {
      // Pode ser MASTER sem companyId — tenta buscar a primeira empresa
      const company = await prisma.company.findFirst({ select: { id: true, name: true } });
      if (!company) throw new Error("Nenhuma empresa encontrada no banco.");
      companyId = company.id;
    }

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });

    // Verifica se o e-mail já existe
    const existing = await prisma.user.findUnique({ where: { email: collabEmail } });
    if (existing) {
      console.log(`⚠️  Usuário ${collabEmail} já existe. Nada foi alterado.`);
      console.log(`   Empresa: ${company?.name ?? companyId}`);
      console.log(`   Role: ${existing.role}`);
      return;
    }

    const passwordHash = await hashPassword(collabPassword);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: collabEmail,
          name: collabName,
          role: "COLLABORATOR",
          emailVerified: true,
          companyId,
          jobTitle: collabJobTitle,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
    });

    console.log(`✅ Colaborador criado com sucesso!`);
    console.log(`   Empresa : ${company?.name ?? companyId}`);
    console.log(`   Nome    : ${collabName}`);
    console.log(`   Cargo   : ${collabJobTitle}`);
    console.log(`   E-mail  : ${collabEmail}`);
    console.log(`   Senha   : ${collabPassword}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
