import type { Request, Response } from "express";
import * as servicio from "../services/turnosService.js";
import type { DatosTurno } from "../schemas/turnoSchema.js";
import { AppError } from "../errors/AppError.js";
import { leerId } from "../utils/leerId.js";
import { filtrosTurnoSchema } from "../schemas/turnoSchema.js";

function turnoNoEncontrado(id: number): AppError {
  return new AppError(404, "NOT_FOUND", `Turno con id ${id} no encontrado`);
}

function medicoInexistente(medicoId: number): AppError {
  return new AppError(404, "MEDICO_NOT_FOUND", `El médico con id ${medicoId} no existe`, [
    { field: "medicoId", message: `No hay un médico registrado con id ${medicoId}` },
  ]);
}

export function obtenerTodos(req: Request, res: Response): void {
  const filtros = filtrosTurnoSchema.parse(req.query);
  res.status(200).json(servicio.listarTurnos(filtros));
}

export function obtenerPorId(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const turno = servicio.obtenerTurno(id);
  if (!turno) throw turnoNoEncontrado(id);
  res.status(200).json(turno);
}

export function crear(req: Request<Record<string, never>, unknown, DatosTurno>, res: Response): void {
  const resultado = servicio.crearTurno(req.body);
  if (!resultado.ok) throw medicoInexistente(req.body.medicoId);
  res.status(201).json(resultado.turno);
}

export function actualizar(req: Request<{ id: string }, unknown, DatosTurno>, res: Response): void {
  const id = leerId(req);
  const resultado = servicio.actualizarTurno(id, req.body);
  if (!resultado.ok) {
    throw resultado.error === "no-encontrado" ? turnoNoEncontrado(id) : medicoInexistente(req.body.medicoId);
  }
  res.status(200).json(resultado.turno);
}

export function eliminar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const eliminado = servicio.eliminarTurno(id);
  if (!eliminado) throw turnoNoEncontrado(id);
  res.status(204).send();
}

