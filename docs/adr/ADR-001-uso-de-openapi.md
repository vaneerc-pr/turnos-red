# ADR-001: Uso de OpenAPI (Swagger) como estándar de documentación del contrato de la API

- **Fecha:** 2026-10-04
- **Estado:** Aceptado
- **Responsable:** Vanessa Reyes Clavero

## Contexto

TurnosRed expone una API REST con dos recursos, Turno y Médico, y diez endpoints. El equipo se prepara para integrarla con otros clientes y servicios, que necesitan conocer con precisión las rutas, los parámetros, los cuerpos de las solicitudes, las respuestas y los errores posibles, sin tener que leer el código fuente.

Hasta la Actividad 2, el contrato estaba descrito de forma manual en el `README.md` (tablas de endpoints y de códigos de error) y, de forma indirecta, en la colección de Postman. Ninguna de las dos fuentes es un contrato formal:

- El README es texto libre: no tiene un formato estándar que otras herramientas puedan leer, y nada impide que quede desactualizado respecto del código.
- La colección de Postman es un conjunto de pruebas y ejemplos. Muestra casos concretos, pero no define de forma completa los tipos, los campos obligatorios ni los valores permitidos.

Además, las reglas de validación reales viven en los schemas de Zod (`src/schemas`). Cualquier documentación debe mantenerse alineada con ellos: por ejemplo, `documento` es texto y no número, y `especialidad` solo admite cuatro valores en Title Case.

## Decisión

Se adopta **OpenAPI 3.0.3** como formato oficial del contrato de la API, con la siguiente implementación:

- Se utiliza **swagger-jsdoc** para generar la especificación a partir de comentarios `@openapi` escritos junto a cada ruta en `src/routes`, de modo que la documentación de un endpoint está en el mismo archivo que su definición.
- La definición base (información general, servidor y componentes reutilizables) se centraliza en `src/config/swagger.ts`.
- Se utiliza **swagger-ui-express** para publicar la documentación interactiva en la ruta pública `/api-docs`, y la especificación en formato JSON en `/api-docs.json`.
- Los esquemas `Turno`, `Medico` y `ErrorResponse` (y los de entrada `TurnoInput` y `MedicoInput`) se definen una sola vez en `components/schemas` y se referencian desde los endpoints.
- El `enum` de especialidades se importa desde la misma constante `ESPECIALIDADES` que usa Zod, para que la documentación y la validación no puedan diferir en ese punto.
- No se declaran esquemas de seguridad (`securitySchemes`), porque la API no tiene autenticación implementada (ver [ADR-002](./ADR-002-adopcion-futura-de-jwt.md)).

## Consecuencias

**Positivas:**

- El contrato queda descrito en un estándar abierto y ampliamente adoptado, que cualquier equipo o herramienta puede interpretar sin conocer la implementación.
- La interfaz `/api-docs` permite explorar y probar los endpoints desde el navegador.
- La documentación vive junto al código y se versiona con Git (*Docs as Code*): un cambio en una ruta y en su documentación pueden revisarse en el mismo commit.
- La especificación en `/api-docs.json` puede reutilizarse para generar clientes, crear servidores mock o ejecutar pruebas de contrato.

**Negativas:**

- Las reglas de validación quedan expresadas dos veces: en Zod (lo que se ejecuta) y en OpenAPI (lo que se documenta). Salvo el `enum` de especialidades, la coincidencia entre ambas depende de la disciplina del equipo.
- swagger-jsdoc no comprueba que las anotaciones coincidan con el comportamiento real: un endpoint puede documentar un código de estado que el controlador no devuelve, y el proyecto compila igual.
- Las anotaciones se escriben en YAML dentro de comentarios, sin verificación de tipos ni autocompletado del editor; un error de indentación puede hacer que un endpoint desaparezca de la documentación sin advertencia.

## Alternativas consideradas

- **Mantener la documentación solo en el README.** Es simple y no agrega dependencias, pero no es un formato estándar, no es interactiva y su desactualización es más difícil de detectar. Se descarta como contrato, aunque el README sigue siendo la guía general del proyecto.
- **Usar la colección de Postman como documentación.** Postman puede publicar documentación a partir de una colección, pero esta describe ejemplos y pruebas, no un contrato completo. Además, ata la documentación a una herramienta específica. Se mantiene como herramienta de pruebas.
- **Escribir la especificación en un archivo separado (`openapi.yaml`).** Da control total sobre el documento y permite validarlo con herramientas externas, pero separa la documentación de las rutas, lo que aumenta el riesgo de que se olvide actualizarla.
- **Generar la especificación directamente desde los schemas de Zod** (por ejemplo, con `@asteasolutions/zod-to-openapi`). Eliminaría la duplicación entre validación y documentación. Se descarta en esta etapa porque implica reescribir los schemas y agregar una dependencia, y la actividad exige integrar swagger-jsdoc. Queda como mejora a evaluar.

## Limitaciones

- La sincronización entre Zod, controladores y OpenAPI es manual: no hay pruebas automáticas que verifiquen que las respuestas reales cumplen el contrato.
- swagger-jsdoc lee las anotaciones desde los archivos `.ts` de `src/routes`, por lo que el servidor debe ejecutarse desde la raíz del proyecto para que la documentación se genere completa.
- Se utiliza OpenAPI 3.0.3, la versión con mejor soporte en las herramientas elegidas, y no la 3.1.
- "Try it out" en `/api-docs` opera sobre los datos en memoria del servidor en ejecución: los cambios que se hagan desde ahí se pierden al reiniciar.

## Impacto sobre el proyecto

- **Dependencias nuevas:** `swagger-jsdoc` y `swagger-ui-express` (y sus tipos como dependencias de desarrollo).
- **Archivos nuevos o modificados:** `src/config/swagger.ts` (nuevo); comentarios `@openapi` en `src/routes/turnosRoutes.ts` y `src/routes/medicosRoutes.ts`; montaje de `/api-docs` y `/api-docs.json` en `src/app.ts`.
- **Lógica de negocio:** sin cambios. Controladores, servicios y schemas de Zod no se modificaron.
- **Proceso de trabajo:** todo cambio en un endpoint (ruta, parámetros, body o códigos de estado) debe actualizar en el mismo commit su anotación `@openapi`, el schema de Zod si corresponde y los casos de Postman afectados.
- **Evolución:** se recomienda incorporar pruebas de contrato automáticas que comparen las respuestas reales con `/api-docs.json`, para detectar desalineaciones (*drift*) antes de integrar cambios.
