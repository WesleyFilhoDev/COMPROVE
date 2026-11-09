import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/server/db/client";
import { Resend } from "resend";
import { otpEmail, resetPasswordEmail, verifyEmailTemplate } from "./email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const auth = betterAuth({
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    appUrl,
    "https://comproved.com.br",
    "https://www.comproved.com.br",
  ],

  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendVerificationEmail({ user, url }: { user: { email: string; name: string }; url: string }) {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@comproved.com.br",
        to: user.email,
        subject: "Confirme seu e-mail — Comproved",
        html: verifyEmailTemplate(user.name, url),
      });
      if (error) console.error("[verify] Resend error:", error);
    },
    async sendResetPassword({ user, url }: { user: { email: string; name: string }; url: string }) {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@comproved.com.br",
        to: user.email,
        subject: "Redefinir senha — Comproved",
        html: resetPasswordEmail(user.name, url),
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
      async sendVerificationOTP({ email, otp }) {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "noreply@comproved.com.br",
          to: email,
          subject: "Seu código de verificação — Comproved",
          html: otpEmail(email.split("@")[0], otp),
        });
        if (error) console.error("[emailOTP] Resend error:", error);
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
