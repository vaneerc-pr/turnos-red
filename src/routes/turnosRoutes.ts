import { Router } from "express";
import * as controlador from "../controllers/turnosController.js";

export const turnosRouter = Router();

turnosRouter.get("/", controlador.obtenerTodos);
turnosRouter.get("/:id", controlador.obtenerPorId);
turnosRouter.post("/", controlador.crear);
turnosRouter.put("/:id", controlador.actualizar);
turnosRouter.delete("/:id", controlador.eliminar);
