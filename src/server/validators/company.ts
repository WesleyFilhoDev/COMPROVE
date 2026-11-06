import { z } from "zod";
import { validateCnpj } from "@/lib/format";

export const companyCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(200),
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(validateCnpj, "CNPJ inválido"),
  zipCode: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP deve ter 8 dígitos"),
  street: z.string().min(1, "Logradouro obrigatório").max(200),
  number: z.string().min(1, "Número obrigatório").max(20),
  complement: z.string().max(100).optional(),
  district: z.string().min(1, "Bairro obrigatório").max(100),
  city: z.string().min(1, "Cidade obrigatória").max(100),
  state: z
    .string()
    .length(2, "Estado deve ter 2 letras")
    .transform((v) => v.toUpperCase()),
});

export type CompanyCreateInput = z.input<typeof companyCreateSchema>;
export type CompanyCreate = z.output<typeof companyCreateSchema>;
