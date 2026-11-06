import { z } from "zod";

export const invitationCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(200),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 10 && v.length <= 11, "Telefone inválido"),
  jobTitle: z.string().min(1, "Cargo obrigatório").max(200),
});

export type InvitationCreateInput = z.input<typeof invitationCreateSchema>;
export type InvitationCreate = z.output<typeof invitationCreateSchema>;

export const invitationAcceptSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
});

export type InvitationAcceptInput = z.input<typeof invitationAcceptSchema>;
export type InvitationAccept = z.output<typeof invitationAcceptSchema>;
