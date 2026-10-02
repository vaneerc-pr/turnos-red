import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { turnosRouter } from "./routes/turnosRoutes.js";

export const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/turnos", turnosRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof SyntaxError) {
    res
      .status(400)
      .json({ mensaje: "El cuerpo de la solicitud no es un JSON válido" });
    return;
  }
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});
