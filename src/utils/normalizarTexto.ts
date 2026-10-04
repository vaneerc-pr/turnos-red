// "Pediatría" → "pediatria" | "CLÍNICA Médica" → "clinica medica"
export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD") // separa cada letra de su tilde: "í" → "i" + "´"
    .replace(/\p{Diacritic}/gu, "") // borra las tildes sueltas
    .toLowerCase()
    .trim();
}

