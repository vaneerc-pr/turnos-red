import { z } from "zod";

// Únicos valores válidos del sistema (formato Title Case, con tildes)
export const ESPECIALIDADES = ["Clínica médica", "Pediatría", "Odontología", "Nutrición"] as const;

export const especialidadSchema = z.enum(ESPECIALIDADES, {
  message: `La especialidad debe ser una de: ${ESPECIALIDADES.join(", ")}`,
});


