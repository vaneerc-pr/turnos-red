import { readFile } from "node:fs/promises";

export async function leerTurnosCrudos(ruta: string): Promise<unknown[]> {
  try {
    const contenido = await readFile(ruta, "utf8");
    const datos: unknown = JSON.parse(contenido);

    if (!Array.isArray(datos)) {
      throw new Error("El archivo no contiene una lista de turnos");
    }
    return datos;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error("Error al leer los turnos:", mensaje);
    return [];
  }
}

/*
 * COMPARACIÓN: la misma lectura usando callbacks (node:fs)
 *
 * import { readFile } from "node:fs";
 *
 * readFile(ruta, "utf8", (error, contenido) => {
 *   if (error) {
 *     console.error("Error al leer los turnos:", error.message);
 *     return;
 *   }
 *   try {
 *     const datos = JSON.parse(contenido);
 *     // Si después hubiera que validar, guardar y notificar,
 *     // cada paso quedaría anidado dentro de este callback.
 *   } catch (errorJson) {
 *     console.error("JSON inválido");
 *   }
 * });
 *
 * POR QUÉ USAMOS PROMESAS CON ASYNC/AWAIT:
 * 1. El código se lee de arriba hacia abajo, sin callbacks anidados.
 * 2. Un solo try...catch maneja el error de lectura y el de JSON.parse.
 *    Con callbacks, esos errores se manejan en dos lugares distintos.
 * 3. La función puede devolver el resultado con return y quien la llama
 *    solo hace await. Un callback no puede "devolver" nada hacia afuera.
 */
