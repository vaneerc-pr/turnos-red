import { busEventos } from "./busEventos.js";

export function registrarEventosEnConsola(): void {
  busEventos.on("turno:creado", (turno) => {
    console.log(`[evento] turno:creado → id ${turno.id}`);
  });
  busEventos.on("turno:actualizado", (turno) => {
    console.log(`[evento] turno:actualizado → id ${turno.id}`);
  });
  busEventos.on("turno:eliminado", (turno) => {
    console.log(`[evento] turno:eliminado → id ${turno.id}`);
  });
}
