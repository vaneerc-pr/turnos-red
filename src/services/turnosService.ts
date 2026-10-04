import type { Turno } from "../models/turno.js";
import type { DatosTurno, FiltrosTurno } from "../schemas/turnoSchema.js";
import { busEventos } from "../events/busEventos.js";
import { obtenerMedico } from "./medicosService.js";
import { normalizarTexto } from "../utils/normalizarTexto.js";

let turnos: Turno[] = [];

export type ResultadoTurno =
  | { ok: true; turno: Turno }
  | { ok: false; error: "no-encontrado" | "medico-inexistente" };

export function inicializarTurnos(iniciales: Turno[]): void {
  turnos = [...iniciales];
}

export function listarTurnos(filtros: FiltrosTurno = {}): Turno[] {
  const { especialidad, fecha, medicoId } = filtros;
  return turnos.filter(
    (t) =>
      (especialidad === undefined || normalizarTexto(t.especialidad) === normalizarTexto(especialidad)) &&
      (fecha === undefined || t.fecha === fecha) &&
      (medicoId === undefined || t.medicoId === medicoId),
  );
}

export function obtenerTurno(id: number): Turno | undefined {
  return turnos.find((t) => t.id === id);
}

function siguienteId(): number {
  return turnos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

// Los datos ya llegan validados por Zod; aquí solo va la regla de negocio
export function crearTurno(datos: DatosTurno): ResultadoTurno {
  if (!obtenerMedico(datos.medicoId)) return { ok: false, error: "medico-inexistente" };
  const turno: Turno = { id: siguienteId(), ...datos };
  turnos.push(turno);
  busEventos.emit("turno:creado", turno);
  return { ok: true, turno };
}

// PUT reemplaza el turno completo (excepto el id)
export function actualizarTurno(id: number, datos: DatosTurno): ResultadoTurno {
  const indice = turnos.findIndex((t) => t.id === id);
  if (indice === -1) return { ok: false, error: "no-encontrado" };
  if (!obtenerMedico(datos.medicoId)) return { ok: false, error: "medico-inexistente" };
  const actualizado: Turno = { id, ...datos };
  turnos[indice] = actualizado;
  busEventos.emit("turno:actualizado", actualizado);
  return { ok: true, turno: actualizado };
}

export function eliminarTurno(id: number): Turno | null {
  const indice = turnos.findIndex((t) => t.id === id);
  if (indice === -1) return null;
  const [eliminado] = turnos.splice(indice, 1);
  if (!eliminado) return null;
  busEventos.emit("turno:eliminado", eliminado);
  return eliminado;
}


