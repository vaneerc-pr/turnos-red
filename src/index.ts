import "dotenv/config";
import { leerTurnosCrudos } from "./services/lectorTurnos.js";

const ruta = process.env.RUTA_TURNOS;

if (!ruta) {
  console.error("Falta la variable RUTA_TURNOS en el archivo .env");
  process.exit(1);
}

const crudos = await leerTurnosCrudos(ruta);
console.log(`Registros leídos: ${crudos.length}`);
