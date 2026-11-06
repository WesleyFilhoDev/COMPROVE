import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const MIN_PASSWORD_LENGTH = 12;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} não está definida.`);
  }
  return value;
}

async function main() {
  const email = requireEnv("MASTER_EMAIL").toLowerCase();
  const password = requireEnv("MASTER_PASSWORD");
  const name = requireEnv("MASTER_NAME");

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `MASTER_PASSWORD precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: requireEnv("DATABASE_URL") }),
  });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Nunca promove uma conta comum nem redefine a senha de um Master.
      if (existing.role !== "MASTER") {
        throw new Error(`${email} já existe e não é uma conta Master.`);
      }
      console.log(`Master ${email} já existe; nada foi alterado.`);
      return;
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name, role: "MASTER", emailVerified: true },
      });

      // No Better Auth, a conta de senha usa o id do usuário como accountId.
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
    });

    console.log(`Master ${email} criado.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
