import { z } from "zod";
import { especialidadSchema } from "./especialidad.js";

export const turnoSchema = z.object({
  paciente: z
    .string({ message: "El paciente es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El paciente no puede estar vacío"),
  documento: z
    .string({ message: "El documento es obligatorio y debe ser texto" })
    .trim()
    .min(1, "El documento no puede estar vacío"),
  especialidad: especialidadSchema,
  fecha: z.iso.date({ message: "La fecha debe tener formato AAAA-MM-DD y ser válida" }),
  hora: z
    .string({ message: "La hora es obligatoria y debe ser texto" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato HH:MM (00:00 a 23:59)"),
  medicoId: z
    .number({ message: "medicoId es obligatorio y debe ser un número" })
    .int("medicoId debe ser un número entero")
    .positive("medicoId debe ser positivo"),
  confirmado: z.boolean({ message: "confirmado debe ser true o false" }).default(false),
  observaciones: z.string({ message: "observaciones debe ser texto" }).trim().optional(),
});

export type DatosTurno = z.infer<typeof turnoSchema>;


// "14/08/2026" → "2026-08-14"; si ya viene en AAAA-MM-DD, la deja igual
function aFechaIso(valor: string): string {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : valor;
}

// Filtros de GET /turnos (todos opcionales; llegan como texto desde la URL)
export const filtrosTurnoSchema = z.object({
  especialidad: z.string().trim().min(1, "especialidad no puede estar vacía").optional(),
  fecha: z
    .string()
    .trim()
    .transform(aFechaIso)
    .pipe(z.iso.date({ message: "fecha debe tener formato AAAA-MM-DD o DD/MM/AAAA y ser válida" }))
    .optional(),
  medicoId: z.coerce
    .number({ message: "medicoId debe ser un número" })
    .int("medicoId debe ser un número entero")
    .positive("medicoId debe ser positivo")
    .optional(),
});

export type FiltrosTurno = z.infer<typeof filtrosTurnoSchema>;