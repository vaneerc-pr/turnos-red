import { Router } from "express";
import * as controlador from "../controllers/medicosController.js";

export const medicosRouter = Router();

medicosRouter.get("/", controlador.obtenerTodos);
medicosRouter.get("/:id", controlador.obtenerPorId);
medicosRouter.post("/", controlador.crear);
medicosRouter.put("/:id", controlador.actualizar);
medicosRouter.delete("/:id", controlador.eliminar);


