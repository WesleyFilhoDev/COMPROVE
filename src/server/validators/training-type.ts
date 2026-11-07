import { z } from "zod";

export const trainingTypeCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
  defaultDurationHours: z
    .number()
    .positive("Carga horária deve ser positiva")
    .optional(),
  declarationText: z
    .string()
    .max(5000, "Texto de declaração deve ter no máximo 5000 caracteres")
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
    .max(2000, "Descrição deve ter no máximo 2000 caracteres")
    .optional(),
  defaultDurationHours: z
    .number()
    .positive("Carga horária deve ser positiva")
    .nullable()
    .optional(),
  declarationText: z
    .string()
    .max(5000, "Texto de declaração deve ter no máximo 5000 caracteres")
    .nullable()
    .optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export type TrainingTypeCreate = z.output<typeof trainingTypeCreateSchema>;
export type TrainingTypeUpdate = z.output<typeof trainingTypeUpdateSchema>;
