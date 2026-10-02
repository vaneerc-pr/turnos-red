import type { Turno, TurnoCrudo } from "../models/turno.js";

const ESPECIALIDADES: Record<string, string> = {
  "clinica medica": "Clínica médica",
  pediatria: "Pediatría",
  odontologia: "Odontología",
  nutricion: "Nutrición",
};

function quitarTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarId(valor: unknown): number | null {
  if (typeof valor !== "string" && typeof valor !== "number") return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizarPaciente(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
  return limpio.length > 0 ? limpio : null;
}

function normalizarDocumento(valor: unknown): string | null {
  if (typeof valor !== "string" && typeof valor !== "number") return null;
  const soloDigitos = String(valor).replace(/\D/g, "");
  return soloDigitos.length > 0 ? soloDigitos : null;
}

function normalizarEspecialidad(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const clave = quitarTildes(valor).trim().toLowerCase();
  return ESPECIALIDADES[clave] ?? null;
}

function normalizarFecha(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const texto = valor.trim();
  const latina = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);

  let fechaIso: string;
  if (latina) fechaIso = `${latina[3]}-${latina[2]}-${latina[1]}`;
  else if (iso) fechaIso = texto;
  else return null;

  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toISOString().slice(0, 10) === fechaIso ? fechaIso : null;
}

function normalizarHora(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const partes = /^(\d{1,2})[.:](\d{2})$/.exec(valor.trim());
  if (!partes) return null;
  const horas = Number(partes[1]);
  const minutos = Number(partes[2]);
  if (horas > 23 || minutos > 59) return null;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function normalizarConfirmado(valor: unknown): boolean | null {
  if (typeof valor === "boolean") return valor;
  if (typeof valor !== "string") return null;
  const texto = quitarTildes(valor).trim().toLowerCase();
  if (texto === "si" || texto === "true") return true;
  if (texto === "no" || texto === "false") return false;
  return null;
}

export function normalizarTurno(crudo: TurnoCrudo): Turno | null {
  const id = normalizarId(crudo.id);
  const paciente = normalizarPaciente(crudo.paciente);
  const documento = normalizarDocumento(crudo.documento);
  const especialidad = normalizarEspecialidad(crudo.especialidad);
  const fecha = normalizarFecha(crudo.fecha);
  const hora = normalizarHora(crudo.hora);
  const confirmado = normalizarConfirmado(crudo.confirmado);

  if (
    id === null ||
    paciente === null ||
    documento === null ||
    especialidad === null ||
    fecha === null ||
    hora === null ||
    confirmado === null
  ) {
    return null;
  }

  const turno: Turno = {
    id,
    paciente,
    documento,
    especialidad,
    fecha,
    hora,
    confirmado,
  };

  if (
    typeof crudo.observaciones === "string" &&
    crudo.observaciones.trim() !== ""
  ) {
    turno.observaciones = crudo.observaciones.trim();
  }
  return turno;
}

export interface ResultadoNormalizacion {
  turnos: Turno[];
  rechazados: number;
}

export function normalizarTurnos(crudos: unknown[]): ResultadoNormalizacion {
  const turnos: Turno[] = [];
  let rechazados = 0;

  crudos.forEach((registro, posicion) => {
    const turno =
      typeof registro === "object" && registro !== null
        ? normalizarTurno(registro as TurnoCrudo)
        : null;

    if (turno) {
      turnos.push(turno);
    } else {
      rechazados++;
      console.warn(`Registro en posición ${posicion} descartado`);
    }
  });

  return { turnos, rechazados };
}
