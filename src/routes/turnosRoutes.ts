import { Router } from "express";
import * as controlador from "../controllers/turnosController.js";
import { validate } from "../middlewares/validate.js";
import { turnoSchema } from "../schemas/turnoSchema.js";

export const turnosRouter = Router();

/**
 * @openapi
 * /turnos:
 *   get:
 *     tags: [Turnos]
 *     summary: Listar turnos
 *     description: Devuelve todos los turnos. Los filtros son opcionales y se pueden combinar.
 *     parameters:
 *       - name: especialidad
 *         in: query
 *         required: false
 *         description: Filtro tolerante; ignora tildes y mayúsculas (Pediatria encuentra Pediatría)
 *         schema:
 *           type: string
 *         example: Pediatría
 *       - name: fecha
 *         in: query
 *         required: false
 *         description: Acepta AAAA-MM-DD o DD/MM/AAAA; debe ser una fecha válida
 *         schema:
 *           type: string
 *         example: "2026-08-14"
 *       - name: medicoId
 *         in: query
 *         required: false
 *         description: Identificador del médico asignado
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de turnos (puede estar vacía)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Turno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
turnosRouter.get("/", controlador.obtenerTodos);

/**
 * @openapi
 * /turnos/{id}:
 *   get:
 *     tags: [Turnos]
 *     summary: Obtener un turno por id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
turnosRouter.get("/:id", controlador.obtenerPorId);

/**
 * @openapi
 * /turnos:
 *   post:
 *     tags: [Turnos]
 *     summary: Crear un turno
 *     description: Valida el body con Zod, verifica que el médico exista, guarda el turno en memoria y emite turno:nuevo por Socket.IO.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoInput'
 *           example:
 *             paciente: Carlos Ruiz
 *             documento: 31.654.210-K
 *             especialidad: Pediatría
 *             fecha: "2026-08-14"
 *             hora: "10:00"
 *             medicoId: 1
 *     responses:
 *       201:
 *         description: Turno creado (confirmado es false si no se envía)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: El médico indicado no existe (MEDICO_NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 404
 *               message: El médico con id 99999 no existe
 *               code: MEDICO_NOT_FOUND
 *               details:
 *                 - field: medicoId
 *                   message: No hay un médico registrado con id 99999
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
turnosRouter.post("/", validate(turnoSchema), controlador.crear);

/**
 * @openapi
 * /turnos/{id}:
 *   put:
 *     tags: [Turnos]
 *     summary: Reemplazar un turno
 *     description: Reemplazo completo; exige todos los campos obligatorios. Emite turno:actualizado por Socket.IO.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoInput'
 *           example:
 *             paciente: Carlos Ruiz
 *             documento: 31.654.210-K
 *             especialidad: Pediatría
 *             fecha: "2026-08-14"
 *             hora: "11:30"
 *             medicoId: 1
 *             confirmado: true
 *     responses:
 *       200:
 *         description: Turno actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: El turno no existe (NOT_FOUND) o el médico indicado no existe (MEDICO_NOT_FOUND)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
turnosRouter.put("/:id", validate(turnoSchema), controlador.actualizar);

/**
 * @openapi
 * /turnos/{id}:
 *   delete:
 *     tags: [Turnos]
 *     summary: Eliminar un turno
 *     description: Emite turno:eliminado por Socket.IO.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Turno eliminado (sin cuerpo)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
turnosRouter.delete("/:id", controlador.eliminar);
