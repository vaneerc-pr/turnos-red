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


