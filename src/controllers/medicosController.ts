import type { Request, Response } from "express";
import * as servicio from "../services/medicosService.js";
import type { DatosMedico } from "../schemas/medicoSchema.js";
import { AppError } from "../errors/AppError.js";
import { leerId } from "../utils/leerId.js";
import { filtrosMedicoSchema } from "../schemas/medicoSchema.js";

function medicoNoEncontrado(id: number): AppError {
  return new AppError(404, "NOT_FOUND", `Médico con id ${id} no encontrado`);
}

export function obtenerTodos(req: Request, res: Response): void {
  const filtros = filtrosMedicoSchema.parse(req.query);
  res.status(200).json(servicio.listarMedicos(filtros));
}

export function obtenerPorId(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const medico = servicio.obtenerMedico(id);
  if (!medico) throw medicoNoEncontrado(id);
  res.status(200).json(medico);
}

export function crear(req: Request<Record<string, never>, unknown, DatosMedico>, res: Response): void {
  const medico = servicio.crearMedico(req.body);
  res.status(201).json(medico);
}

export function actualizar(req: Request<{ id: string }, unknown, DatosMedico>, res: Response): void {
  const id = leerId(req);
  const medico = servicio.actualizarMedico(id, req.body);
  if (!medico) throw medicoNoEncontrado(id);
  res.status(200).json(medico);
}

export function eliminar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  const eliminado = servicio.eliminarMedico(id);
  if (!eliminado) throw medicoNoEncontrado(id);
  res.status(204).send();
}

