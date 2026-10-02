import type { Turno } from "../models/turno.js";
import { normalizarTurno } from "./normalizador.js";
import { busEventos } from "../events/busEventos.js";

let turnos: Turno[] = [];

export type ResultadoActualizacion =
  | { ok: true; turno: Turno }
  | { ok: false; error: "no-encontrado" | "invalido" };

export function inicializarTurnos(iniciales: Turno[]): void {
  turnos = [...iniciales];
}

export function listarTurnos(): Turno[] {
  return turnos;
}

export function obtenerTurno(id: number): Turno | undefined {
  return turnos.find((t) => t.id === id);
}

function siguienteId(): number {
  return turnos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

export function crearTurno(datos: unknown): Turno | null {
  if (typeof datos !== "object" || datos === null) return null;
  const turno = normalizarTurno({ ...datos, id: siguienteId() });
  if (!turno) return null;
  turnos.push(turno);
  busEventos.emit("turno:creado", turno);
  return turno;
}

export function actualizarTurno(
  id: number,
  datos: unknown,
): ResultadoActualizacion {
  const indice = turnos.findIndex((t) => t.id === id);
  if (indice === -1) return { ok: false, error: "no-encontrado" };
  if (typeof datos !== "object" || datos === null)
    return { ok: false, error: "invalido" };

  const actualizado = normalizarTurno({ ...turnos[indice], ...datos, id });
  if (!actualizado) return { ok: false, error: "invalido" };

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
