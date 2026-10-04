import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Recibe un schema y devuelve un middleware que valida req.body con él
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      next(resultado.error); // el ZodError viaja al errorHandler
      return;
    }
    req.body = resultado.data; // datos limpios: con trim, defaults y sin campos extra
    next();
  };
}

