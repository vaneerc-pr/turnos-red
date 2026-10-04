import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { turnosRouter } from "./routes/turnosRoutes.js";
import { medicosRouter } from "./routes/medicosRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use("/turnos", turnosRouter);
app.use("/medicos", medicosRouter);

// Documentación interactiva (Swagger UI) y especificación en JSON
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Siempre al final, en este orden
app.use(notFoundHandler);
app.use(errorHandler);


