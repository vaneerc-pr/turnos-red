import express from "express";
import { turnosRouter } from "./routes/turnosRoutes.js";
import { medicosRouter } from "./routes/medicosRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/turnos", turnosRouter);
app.use("/medicos", medicosRouter);

// Siempre al final, en este orden
app.use(notFoundHandler);
app.use(errorHandler);


