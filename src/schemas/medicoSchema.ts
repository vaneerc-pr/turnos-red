import { z } from "zod";
import { especialidadSchema } from "./especialidad.js";

export const medicoSchema = z.object({
  nombre: z
    .string({ message: "El nombre es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El nombre no puede estar vacío"),
  especialidad: especialidadSchema,
  disponible: z.boolean({ message: "disponible debe ser true o false" }),
});

// Tipo TypeScript generado automáticamente desde el schema
export type DatosMedico = z.infer<typeof medicoSchema>;

// Filtros de GET /medicos (todos opcionales)
export const filtrosMedicoSchema = z.object({
  especialidad: z.string().trim().min(1, "especialidad no puede estar vacía").optional(),
  disponible: z
    .enum(["true", "false"], { message: "disponible debe ser true o false" })
    .transform((valor) => valor === "true")
    .optional(),
});

export type FiltrosMedico = z.infer<typeof filtrosMedicoSchema>;


