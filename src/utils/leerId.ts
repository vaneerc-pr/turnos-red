import { AppError } from "../errors/AppError.js";

// Valida el :id de la URL; si es inválido, lanza 400
export function leerId(req: { params: { id: string } }): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, "INVALID_ID", "El id debe ser un número entero positivo", [
      { field: "id", message: `Valor recibido: "${req.params.id}"` },
    ]);
  }
  return id;
}


