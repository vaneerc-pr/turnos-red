import { EventEmitter } from "node:events";
import type { Turno } from "../models/turno.js";

interface EventosTurnos {
  "turno:creado": [Turno];
  "turno:actualizado": [Turno];
  "turno:eliminado": [Turno];
}

export const busEventos = new EventEmitter<EventosTurnos>();
