import type { Medico } from "../models/medico.js";
import type { DatosMedico } from "../schemas/medicoSchema.js";

// Datos iniciales en memoria (se reinician al reiniciar el servidor)
const medicos: Medico[] = [
  { id: 1, nombre: "Laura Gómez", especialidad: "Pediatría", disponible: true },
  { id: 2, nombre: "Martín Rojas", especialidad: "Odontología", disponible: true },
  { id: 3, nombre: "Sofía Herrera", especialidad: "Clínica médica", disponible: false },
  { id: 4, nombre: "Andrés Paredes", especialidad: "Nutrición", disponible: true },
];

function siguienteId(): number {
  return medicos.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

export function listarMedicos(): Medico[] {
  return medicos;
}

export function obtenerMedico(id: number): Medico | undefined {
  return medicos.find((m) => m.id === id);
}

export function crearMedico(datos: DatosMedico): Medico {
  const medico: Medico = { id: siguienteId(), ...datos };
  medicos.push(medico);
  return medico;
}

// PUT reemplaza el recurso completo (excepto el id)
export function actualizarMedico(id: number, datos: DatosMedico): Medico | null {
  const indice = medicos.findIndex((m) => m.id === id);
  if (indice === -1) return null;
  const actualizado: Medico = { id, ...datos };
  medicos[indice] = actualizado;
  return actualizado;
}

export function eliminarMedico(id: number): Medico | null {
  const indice = medicos.findIndex((m) => m.id === id);
  if (indice === -1) return null;
  const [eliminado] = medicos.splice(indice, 1);
  return eliminado ?? null;
}

