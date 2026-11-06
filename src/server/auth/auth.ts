import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/server/db/client";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
