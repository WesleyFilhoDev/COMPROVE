import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Conexão direta: migrações não passam pelo pooler do Neon.
    // Sem fallback, `prisma generate` falharia em ambientes sem o .env.
    url: process.env.DIRECT_URL ?? "",
  },
});
