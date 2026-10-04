import { Router } from "express";
import * as controlador from "../controllers/turnosController.js";
import { validate } from "../middlewares/validate.js";
import { turnoSchema } from "../schemas/turnoSchema.js";

export const turnosRouter = Router();

turnosRouter.get("/", controlador.obtenerTodos);
turnosRouter.get("/:id", controlador.obtenerPorId);
turnosRouter.post("/", validate(turnoSchema), controlador.crear);
turnosRouter.put("/:id", validate(turnoSchema), controlador.actualizar);
turnosRouter.delete("/:id", controlador.eliminar);

