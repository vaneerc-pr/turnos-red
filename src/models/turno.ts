// Cómo pueden venir los datos desde las sedes (sucios)
export interface TurnoCrudo {
  id?: string | number;
  paciente?: string;
  documento?: string | number;
  especialidad?: string;
  fecha?: string;
  hora?: string;
  confirmado?: string | boolean;
  observaciones?: string;
}

// Cómo los usa la aplicación (limpios y validados)
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  medicoId?: number;
  confirmado: boolean;
  observaciones?: string;
}
