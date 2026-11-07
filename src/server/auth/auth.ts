import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/server/db/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendVerificationEmail({ user, url }: { user: { email: string; name: string }; url: string }) {
      console.log(`[verify] ${user.email} → ${url}`);
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@comproved.com.br",
        to: user.email,
        subject: "Confirme seu e-mail — Comproved",
        html: `<p>Olá, ${user.name}!</p><p>Clique no link abaixo para confirmar seu e-mail e ativar sua conta:</p><p><a href="${url}">${url}</a></p><p>O link expira em 24 horas.</p>`,
      });
      if (error) console.error("[verify] Resend error:", error);
    },
    async sendResetPasswordEmail({ user, url }: { user: { email: string; name: string }; url: string }) {
      if (process.env.NODE_ENV === "development") console.log(`[reset-password] ${user.email}`);
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@comproved.com.br",
        to: user.email,
        subject: "Redefinir senha — Comproved",
        html: `<p>Olá, ${user.name}!</p><p>Recebemos uma solicitação para redefinir a senha da sua conta.</p><p>Clique no link abaixo para criar uma nova senha:</p><p><a href="${url}">${url}</a></p><p>O link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.</p>`,
      });
      if (error) console.error("[reset-password] Resend error:", error);
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        // integração com Resend adicionada no Step 3
        if (process.env.NODE_ENV === "development") {
          console.log(`[emailOTP] ${email} → ${otp} (${type})`);
        }
      },
    }),
  ],

  user: {
    additionalFields: {
      role: { type: "string", nullable: true, input: false },
      companyId: { type: "string", nullable: true, input: false },
      phone: { type: "string", nullable: true, input: true },
      jobTitle: { type: "string", nullable: true, input: true },
      deactivatedAt: { type: "date", nullable: true, input: false },
    },
  },
});

export type Auth = typeof auth;
