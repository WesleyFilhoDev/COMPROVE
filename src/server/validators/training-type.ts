import { z } from "zod";

export const trainingTypeCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

export const trainingTypeUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
});

export type TrainingTypeCreate = z.output<typeof trainingTypeCreateSchema>;
export type TrainingTypeUpdate = z.output<typeof trainingTypeUpdateSchema>;
