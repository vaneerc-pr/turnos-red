import { Router } from "express";
import * as controlador from "../controllers/medicosController.js";
import { validate } from "../middlewares/validate.js";
import { medicoSchema } from "../schemas/medicoSchema.js";

export const medicosRouter = Router();

medicosRouter.get("/", controlador.obtenerTodos);
medicosRouter.get("/:id", controlador.obtenerPorId);
medicosRouter.post("/", validate(medicoSchema), controlador.crear);
medicosRouter.put("/:id", validate(medicoSchema), controlador.actualizar);
medicosRouter.delete("/:id", controlador.eliminar);

