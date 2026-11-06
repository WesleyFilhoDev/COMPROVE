# Comproved

Aplicação web para gerar documentos de comprovação de treinamentos. Multi-tenant, feita com Next.js, Prisma e Neon.

## Primeiros passos

Requer o Node da versão em `.nvmrc`.

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL` e as variáveis `MASTER_*`.
3. Aplique as migrações: `npm run db:migrate`
4. Crie o usuário Master: `npm run db:seed`
5. Inicie o projeto: `npm run dev`

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm run db:generate` | Gera o client do Prisma |
| `npm run db:migrate` | Aplica as migrações pendentes |
| `npm run db:seed` | Cria o usuário Master |
