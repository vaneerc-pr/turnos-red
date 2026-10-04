import { Router } from "express";
import * as controlador from "../controllers/medicosController.js";
import { validate } from "../middlewares/validate.js";
import { medicoSchema } from "../schemas/medicoSchema.js";

export const medicosRouter = Router();

/**
 * @openapi
 * /medicos:
 *   get:
 *     tags: [Médicos]
 *     summary: Listar médicos
 *     description: Devuelve todos los médicos. Los filtros son opcionales y se pueden combinar.
 *     parameters:
 *       - name: especialidad
 *         in: query
 *         required: false
 *         description: Filtro tolerante; ignora tildes y mayúsculas
 *         schema:
 *           type: string
 *         example: Odontología
 *       - name: disponible
 *         in: query
 *         required: false
 *         description: Solo se aceptan los textos "true" o "false"
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         example: "true"
 *     responses:
 *       200:
 *         description: Lista de médicos (puede estar vacía)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medico'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
medicosRouter.get("/", controlador.obtenerTodos);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     tags: [Médicos]
 *     summary: Obtener un médico por id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Médico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
medicosRouter.get("/:id", controlador.obtenerPorId);

/**
 * @openapi
 * /medicos:
 *   post:
 *     tags: [Médicos]
 *     summary: Registrar un médico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoInput'
 *           example:
 *             nombre: Paula Rivas
 *             especialidad: Pediatría
 *             disponible: true
 *     responses:
 *       201:
 *         description: Médico creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
medicosRouter.post("/", validate(medicoSchema), controlador.crear);

/**
 * @openapi
 * /medicos/{id}:
 *   put:
 *     tags: [Médicos]
 *     summary: Reemplazar un médico
 *     description: Reemplazo completo; exige todos los campos.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoInput'
 *           example:
 *             nombre: Paula Rivas
 *             especialidad: Pediatría
 *             disponible: false
 *     responses:
 *       200:
 *         description: Médico actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
medicosRouter.put("/:id", validate(medicoSchema), controlador.actualizar);

/**
 * @openapi
 * /medicos/{id}:
 *   delete:
 *     tags: [Médicos]
 *     summary: Dar de baja un médico
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       204:
 *         description: Médico eliminado (sin cuerpo)
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
medicosRouter.delete("/:id", controlador.eliminar);
