import { z } from "zod";

export const trainingCreateSchema = z.object({
  trainingTypeId: z.string().min(1, "Tipo de treinamento é obrigatório."),
  instructorId: z.string().min(1, "Instrutor é obrigatório."),
  startsAt: z.string().min(1, "Data de início é obrigatória."),
  endsAt: z.string().min(1, "Data de término é obrigatória."),
  traineeName: z
    .string()
    .min(2, "Nome do treinando deve ter ao menos 2 caracteres.")
    .max(200, "Nome do treinando deve ter no máximo 200 caracteres."),
  traineeCpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(11, "CPF deve ter 11 dígitos.")),
  clientCompanyName: z
    .string()
    .min(2, "Nome da empresa cliente deve ter ao menos 2 caracteres.")
    .max(200, "Nome da empresa cliente deve ter no máximo 200 caracteres."),
});

export const trainingUpdateSchema = z.object({
  trainingTypeId: z.string().min(1).optional(),
  instructorId: z.string().min(1).optional(),
  startsAt: z.string().min(1).optional(),
  endsAt: z.string().min(1).optional(),
  traineeName: z.string().min(2).max(200).optional(),
  traineeCpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().length(11, "CPF deve ter 11 dígitos."))
    .optional(),
  clientCompanyName: z.string().min(2).max(200).optional(),
});

export const trainingCancelSchema = z.object({
  reason: z
    .string()
    .min(10, "Motivo deve ter ao menos 10 caracteres.")
    .max(500, "Motivo deve ter no máximo 500 caracteres."),
});

export type TrainingCreate = z.output<typeof trainingCreateSchema>;
export type TrainingUpdate = z.output<typeof trainingUpdateSchema>;
export type TrainingCancel = z.output<typeof trainingCancelSchema>;
