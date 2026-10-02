# TurnosRed

Prototipo de backend para centralizar la gestion de turnos medicos de varios centros de atencion ambulatoria (clinica medica, pediatria, odontologia y nutricion).

El servidor lee los registros que envian las sedes en formato JSON (con formatos inconsistentes), los **normaliza y valida**, los expone mediante una **API REST** con Express y **notifica en tiempo real** los cambios a los clientes conectados mediante Socket.IO.

Proyecto desarrollado para la Actividad 1 del ramo *Integraciones Web*.

## Tecnologias

- Node.js 24 (LTS) + TypeScript
- Express (API REST)
- Socket.IO (comunicacion en tiempo real)
- EventEmitter de Node.js (bus de eventos internos)
- ESLint + Prettier (calidad y formato de codigo)

## Requisitos previos

- [NVM](https://github.com/nvm-sh/nvm) para gestionar la version de Node.js
- Node.js **v24.21.0** (definida en `.nvmrc`)
- npm (se instala junto con Node.js)
- Git
- Postman u otro cliente HTTP para probar la API

## Instalacion

```bash
# 1. Clonar el repositorio
git clone https://github.com/vaneerc-pr/turnos-red.git
cd turnos-red

# 2. Usar la version de Node.js del proyecto
nvm install
nvm use

# 3. Instalar dependencias (versiones exactas desde package-lock.json)
npm install

# 4. Crear el archivo de variables de entorno a partir de la plantilla
cp .env.example .env

# 5. Compilar y ejecutar
npm run build
npm start
```

El servidor queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable      | Descripcion                                                  | Valor de ejemplo   |
|---------------|--------------------------------------------------------------|--------------------|
| `PORT`        | Puerto en el que escucha el servidor                         | `3000`             |
| `RUTA_TURNOS` | Ruta (relativa a la raiz del proyecto) del archivo de turnos | `data/turnos.json` |

El archivo `.env` esta excluido del repositorio mediante `.gitignore`. Se debe crear a partir de `.env.example`.

## Scripts disponibles

| Script           | Comando                 | Descripcion                                                    |
|------------------|-------------------------|----------------------------------------------------------------|
| `npm run build`  | `tsc`                   | Compila el codigo TypeScript de `src/` a JavaScript en `dist/` |
| `npm start`      | `node dist/index.js`    | Ejecuta el servidor compilado                                  |
| `npm run lint`   | `eslint . --ext .ts`    | Analiza el codigo en busca de errores y malas practicas        |
| `npm run format` | `prettier --write src/` | Aplica formato homogeneo al codigo fuente                      |

> Cada cambio en `src/` requiere ejecutar `npm run build` antes de `npm start`.

## Estructura del proyecto

```
turnos-red/
|-- data/
|   |-- turnos.json               # Datos crudos enviados por las sedes
|-- public/
|   |-- index.html                # Cliente web de prueba (Socket.IO)
|-- src/
|   |-- controllers/
|   |   |-- turnosController.ts   # Recibe la solicitud y define el codigo HTTP
|   |-- events/
|   |   |-- busEventos.ts         # Bus de eventos internos (EventEmitter)
|   |   |-- registroConsola.ts    # Oyente que registra los eventos en consola
|   |-- models/
|   |   |-- turno.ts              # Interfaces TurnoCrudo y Turno
|   |-- realtime/
|   |   |-- socket.ts             # Puente entre el bus de eventos y Socket.IO
|   |-- routes/
|   |   |-- turnosRoutes.ts       # Asocia metodo + ruta con su controlador
|   |-- services/
|   |   |-- lectorTurnos.ts       # Lectura asincrona del archivo (fs/promises)
|   |   |-- normalizador.ts       # Limpieza y validacion de registros
|   |   |-- turnosService.ts      # Logica de negocio y datos en memoria
|   |-- app.ts                    # Configuracion de Express
|   |-- index.ts                  # Punto de entrada
|-- .env.example
|-- .gitignore
|-- .nvmrc
|-- .prettierrc
|-- eslint.config.mjs
|-- package.json
|-- package-lock.json
|-- tsconfig.json
```

**Flujo de una solicitud:**

```
Cliente HTTP -> routes -> controllers -> services -> datos en memoria
                                            |
                                            +-> busEventos -+-> registro en consola
                                                            +-> Socket.IO -> clientes conectados
```

Cada capa tiene una sola responsabilidad: las **rutas** dirigen la solicitud, los **controladores** validan la entrada y responden con el codigo HTTP, los **servicios** aplican la logica y modifican los datos, y los **modelos** definen la forma de los datos.

## Endpoints

| Metodo | Ruta          | Descripcion                | Codigos       |
|--------|---------------|----------------------------|---------------|
| GET    | `/turnos`     | Lista todos los turnos     | 200           |
| GET    | `/turnos/:id` | Obtiene un turno por su id | 200, 400, 404 |
| POST   | `/turnos`     | Crea un turno              | 201, 400      |
| PUT    | `/turnos/:id` | Actualiza un turno         | 200, 400, 404 |
| DELETE | `/turnos/:id` | Elimina un turno           | 200, 400, 404 |

Ante cualquier error inesperado, el servidor responde **500**.

## Eventos en tiempo real

| Evento interno (EventEmitter) | Evento emitido a clientes (Socket.IO) |
|-------------------------------|---------------------------------------|
| `turno:creado`                | `turno:nuevo`                         |
| `turno:actualizado`           | `turno:actualizado`                   |
| `turno:eliminado`             | `turno:eliminado`                     |

Para probarlo, abrir `http://localhost:3000` en el navegador y realizar operaciones desde Postman: la tabla se actualiza sin recargar la pagina.

## Normalizacion de datos

Al iniciar, los registros de `turnos.json` se transforman al modelo `Turno`:

- `id`: convertido a numero; debe ser entero positivo.
- `paciente`: sin espacios sobrantes y con mayuscula inicial en cada palabra.
- `documento`: convertido a texto, solo digitos.
- `especialidad`: unificada a una de las cuatro especialidades validas.
- `fecha`: formato `AAAA-MM-DD`. `hora`: formato `HH:MM`.
- `confirmado`: convertido a booleano (`si` / `no` / `true` / `false`).

Los registros que no pueden normalizarse se descartan, y se informa por consola la cantidad de registros aceptados y rechazados. Los turnos creados o modificados por la API pasan por la misma validacion.

## Limitaciones conocidas

- Los datos se mantienen **en memoria**: al reiniciar el servidor se vuelve a cargar `turnos.json` y se pierden los cambios realizados mediante la API.
- La capitalizacion de nombres no contempla particulas (por ejemplo, "de la" queda como "De La").