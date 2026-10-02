import type { Request, Response } from "express";
import * as servicio from "../services/turnosService.js";

function leerId(req: Request<{ id: string }>): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function obtenerTodos(_req: Request, res: Response): void {
  res.status(200).json(servicio.listarTurnos());
}

export function obtenerPorId(
  req: Request<{ id: string }>,
  res: Response,
): void {
  const id = leerId(req);
  if (id === null) {
    res.status(400).json({ mensaje: "El id debe ser un entero positivo" });
    return;
  }
  const turno = servicio.obtenerTurno(id);
  if (!turno) {
    res.status(404).json({ mensaje: "Turno no encontrado" });
    return;
  }
  res.status(200).json(turno);
}

export function crear(req: Request, res: Response): void {
  const turno = servicio.crearTurno(req.body);
  if (!turno) {
    res
      .status(400)
      .json({ mensaje: "Datos del turno inválidos o incompletos" });
    return;
  }
  res.status(201).json(turno);
}

export function actualizar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  if (id === null) {
    res.status(400).json({ mensaje: "El id debe ser un entero positivo" });
    return;
  }
  const resultado = servicio.actualizarTurno(id, req.body);
  if (!resultado.ok) {
    if (resultado.error === "no-encontrado") {
      res.status(404).json({ mensaje: "Turno no encontrado" });
    } else {
      res.status(400).json({ mensaje: "Datos del turno inválidos" });
    }
    return;
  }
  res.status(200).json(resultado.turno);
}

export function eliminar(req: Request<{ id: string }>, res: Response): void {
  const id = leerId(req);
  if (id === null) {
    res.status(400).json({ mensaje: "El id debe ser un entero positivo" });
    return;
  }
  const eliminado = servicio.eliminarTurno(id);
  if (!eliminado) {
    res.status(404).json({ mensaje: "Turno no encontrado" });
    return;
  }
  res.status(200).json({ mensaje: "Turno eliminado", turno: eliminado });
}
