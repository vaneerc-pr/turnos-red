import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { ZodError } from "zod";


// Rutas que no existen → 404 con el formato estándar
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "ROUTE_NOT_FOUND", `La ruta ${req.method} ${req.originalUrl} no existe`));
}

// Express reconoce un middleware de errores porque tiene 4 parámetros
export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  // 0. Si la respuesta ya empezo a enviarse, Expess se encarga
  if (res.headersSent) {
    next(err);
    return;
  }
  
    // 1. errores que lanzamos nosotros a proposito
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

    // 2. Errores de validación de Zod → 400 con el detalle de cada campo
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: "Error de validación en los datos ingresados",
      code: "VALIDATION_ERROR",
      details: err.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.map(String).join(".") : "body",
        message: issue.path.length > 0 ? issue.message : "El cuerpo de la solicitud debe ser un objeto JSON",
      })),
    });
    return;
  }


  // 3. JSON mal escrito en el body (lo detecta express.json())
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      status: 400,
      message: "El cuerpo de la solicitud no es un JSON válido",
      code: "INVALID_JSON",
      details: [],
    });
    return;
  }

  // 4. Cualquier otra cosa es un fallo nuestro → 500, sin exponer detalles internos
  console.error(err);
  res.status(500).json({
    status: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_ERROR",
    details: [],
  });
}

