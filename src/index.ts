import "dotenv/config";
import { createServer } from "node:http";
import { app } from "./app.js";
import { leerTurnosCrudos } from "./services/lectorTurnos.js";
import { normalizarTurnos } from "./services/normalizador.js";
import { inicializarTurnos } from "./services/turnosService.js";
import { registrarEventosEnConsola } from "./events/registroConsola.js";
import { iniciarTiempoReal } from "./realtime/socket.js";

const ruta = process.env.RUTA_TURNOS;
const puerto = Number(process.env.PORT ?? 3000);

if (!ruta) {
  console.error("Falta la variable RUTA_TURNOS en el archivo .env");
  process.exit(1);
}

const crudos = await leerTurnosCrudos(ruta);
const { turnos, rechazados } = normalizarTurnos(crudos);
console.log(
  `Registros aceptados: ${turnos.length} | rechazados: ${rechazados}`,
);

registrarEventosEnConsola();
inicializarTurnos(turnos);

const servidorHttp = createServer(app);
iniciarTiempoReal(servidorHttp);

servidorHttp.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
