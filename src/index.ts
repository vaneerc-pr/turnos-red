import "dotenv/config";
import { leerTurnosCrudos } from "./services/lectorTurnos.js";
import { normalizarTurnos } from "./services/normalizador.js";

const ruta = process.env.RUTA_TURNOS;

if (!ruta) {
  console.error("Falta la variable RUTA_TURNOS en el archivo .env");
  process.exit(1);
}

const crudos = await leerTurnosCrudos(ruta);
const { turnos, rechazados } = normalizarTurnos(crudos);

console.log(
  `Registros aceptados: ${turnos.length} | rechazados: ${rechazados}`,
);
console.log(turnos);
