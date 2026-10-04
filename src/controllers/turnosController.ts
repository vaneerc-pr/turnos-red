import type { Request, Response } from "express";
import * as servicio from "../services/turnosService.js";
import { AppError } from "../errors/AppError.js";
import { leerId } from "../utils/leerId.js";



function turnoNoEncontrado(id: number): AppError {
  return new AppError(404, "NOT_FOUND", `Turno con id ${id} no encontrado`);
}

function datosInvalidos(): AppError {
  return new AppError(400, "VALIDATION_ERROR", "Error de validación en los datos ingresados");
}

export function obtenerTodos(_req: Request, res: Response): void {
  res.status(200).json(servicio.listarTurnos());
}

export function obtenerPorId(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const turno = servicio.obtenerTurno(id);
  if (!turno) throw turnoNoEncontrado(id);
  res.status(200).json(turno);
}

export function crear(req: Request, res: Response): void {
  const turno = servicio.crearTurno(req.body);
  if (!turno) throw datosInvalidos();
  res.status(201).json(turno);
}

export function actualizar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const resultado = servicio.actualizarTurno(id, req.body);
  if (!resultado.ok) {
    throw resultado.error === "no-encontrado" ? turnoNoEncontrado(id) : datosInvalidos();
  }
  res.status(200).json(resultado.turno);
}

export function eliminar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const eliminado = servicio.eliminarTurno(id);
  if (!eliminado) throw turnoNoEncontrado(id);
  res.status(204).send();
}