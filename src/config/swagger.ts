import swaggerJSDoc from "swagger-jsdoc";
import { ESPECIALIDADES } from "../schemas/especialidad.js";

const puerto = Number(process.env.PORT ?? 3000);

// Definición base del contrato. Las rutas se documentan con comentarios
// @openapi dentro de src/routes y swagger-jsdoc las combina con esto.
const definition: swaggerJSDoc.OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "TurnosRed API",
    version: "1.0.0",
    description:
      "API REST para gestionar turnos médicos y médicos de centros de atención ambulatoria. " +
      "Los datos se mantienen en memoria: los turnos de las sedes se cargan desde data/turnos.json " +
      "al iniciar y los cambios se pierden al reiniciar el servidor. La API no tiene autenticación.",
  },
  servers: [{ url: `http://localhost:${puerto}`, description: "Servidor local" }],
  tags: [
    { name: "Turnos", description: "Gestión de turnos médicos" },
    { name: "Médicos", description: "Gestión de médicos" },
  ],
  components: {
    schemas: {
      // El enum se toma de la misma constante que usa Zod: una sola fuente de verdad
      Especialidad: {
        type: "string",
        enum: [...ESPECIALIDADES],
        example: "Pediatría",
      },
      TurnoInput: {
        type: "object",
        description: "Datos para crear o reemplazar un turno (POST y PUT). Espejo de turnoSchema (Zod).",
        required: ["paciente", "documento", "especialidad", "fecha", "hora", "medicoId"],
        properties: {
          paciente: { type: "string", minLength: 1, description: "Se eliminan espacios sobrantes", example: "Carlos Ruiz" },
          documento: {
            type: "string",
            minLength: 1,
            description: "Texto para admitir formatos flexibles (puntos, guion, dígito verificador)",
            example: "31.654.210-K",
          },
          especialidad: { $ref: "#/components/schemas/Especialidad" },
          fecha: { type: "string", format: "date", description: "AAAA-MM-DD, debe ser una fecha válida", example: "2026-08-14" },
          hora: {
            type: "string",
            pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
            description: "HH:MM entre 00:00 y 23:59",
            example: "10:00",
          },
          medicoId: { type: "integer", minimum: 1, description: "Debe corresponder a un médico existente", example: 1 },
          confirmado: { type: "boolean", default: false, example: false },
          observaciones: { type: "string", example: "Trae estudios previos" },
        },
      },
      Turno: {
        type: "object",
        description: "Turno tal como lo devuelve la API.",
        required: ["id", "paciente", "documento", "especialidad", "fecha", "hora", "confirmado"],
        properties: {
          id: { type: "integer", example: 105 },
          paciente: { type: "string", example: "Carlos Ruiz" },
          documento: { type: "string", example: "31.654.210-K" },
          especialidad: { $ref: "#/components/schemas/Especialidad" },
          fecha: { type: "string", format: "date", example: "2026-08-14" },
          hora: { type: "string", example: "10:00" },
          medicoId: {
            type: "integer",
            description: "Opcional en la respuesta: los turnos cargados desde las sedes no tienen médico asignado",
            example: 1,
          },
          confirmado: { type: "boolean", example: false },
          observaciones: { type: "string", example: "Trae estudios previos" },
        },
      },
      MedicoInput: {
        type: "object",
        description: "Datos para crear o reemplazar un médico (POST y PUT). Espejo de medicoSchema (Zod).",
        required: ["nombre", "especialidad", "disponible"],
        properties: {
          nombre: { type: "string", minLength: 1, description: "Se eliminan espacios sobrantes", example: "Paula Rivas" },
          especialidad: { $ref: "#/components/schemas/Especialidad" },
          disponible: { type: "boolean", example: true },
        },
      },
      Medico: {
        type: "object",
        description: "Médico tal como lo devuelve la API.",
        required: ["id", "nombre", "especialidad", "disponible"],
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "Laura Gómez" },
          especialidad: { $ref: "#/components/schemas/Especialidad" },
          disponible: { type: "boolean", example: true },
        },
      },
      ErrorDetail: {
        type: "object",
        properties: {
          field: { type: "string", example: "especialidad" },
          message: {
            type: "string",
            example: "La especialidad debe ser una de: Clínica médica, Pediatría, Odontología, Nutrición",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        description: "Formato único de todas las respuestas de error (middleware errorHandler).",
        required: ["status", "message", "code", "details"],
        properties: {
          status: { type: "integer", example: 400 },
          message: { type: "string", example: "Error de validación en los datos ingresados" },
          code: {
            type: "string",
            enum: [
              "VALIDATION_ERROR",
              "INVALID_ID",
              "INVALID_JSON",
              "NOT_FOUND",
              "MEDICO_NOT_FOUND",
              "ROUTE_NOT_FOUND",
              "INTERNAL_ERROR",
            ],
            example: "VALIDATION_ERROR",
          },
          details: { type: "array", items: { $ref: "#/components/schemas/ErrorDetail" } },
        },
      },
    },
    parameters: {
      IdParam: {
        name: "id",
        in: "path",
        required: true,
        description: "Identificador numérico (entero positivo)",
        schema: { type: "integer", minimum: 1 },
        example: 1,
      },
    },
    responses: {
      BadRequest: {
        description: "Datos inválidos: body, id o filtros (VALIDATION_ERROR, INVALID_ID o INVALID_JSON)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              status: 400,
              message: "Error de validación en los datos ingresados",
              code: "VALIDATION_ERROR",
              details: [
                {
                  field: "especialidad",
                  message: "La especialidad debe ser una de: Clínica médica, Pediatría, Odontología, Nutrición",
                },
              ],
            },
          },
        },
      },
      NotFound: {
        description: "Recurso no encontrado (NOT_FOUND)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: 404, message: "Turno con id 99999 no encontrado", code: "NOT_FOUND", details: [] },
          },
        },
      },
      InternalError: {
        description: "Error inesperado del servidor (INTERNAL_ERROR). No expone detalles internos.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: { status: 500, message: "Error interno del servidor", code: "INTERNAL_ERROR", details: [] },
          },
        },
      },
    },
  },
  // Sin securitySchemes: la API no implementa autenticación en esta etapa (ver ADR-002)
};

export const swaggerSpec = swaggerJSDoc({
  definition,
  // Se leen los .ts de src/routes: el servidor debe ejecutarse desde la raíz del proyecto
  apis: ["./src/routes/*.ts"],
});
