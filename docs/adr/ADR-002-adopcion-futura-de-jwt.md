# ADR-002: Adopción futura de JWT para autenticación y autorización

- **Fecha:** 2026-10-04
- **Estado:** Propuesto
- **Responsable:** Vanessa Reyes Clavero

> Este ADR se mantiene en estado **Propuesto**: la autenticación no forma parte de la etapa actual y no está implementada. Su objetivo es dejar analizada la decisión para una etapa posterior.

## Contexto

Actualmente la API de TurnosRed no tiene autenticación: cualquier cliente que conozca la URL puede listar, crear, modificar y eliminar turnos y médicos. Esto era aceptable en un prototipo de uso interno, pero deja de serlo cuando la API se integre con otros clientes y servicios:

- Los turnos contienen datos personales de pacientes (nombre y documento de identidad).
- No es posible saber quién realizó una operación ni restringir acciones según el rol (por ejemplo, que solo un perfil administrativo pueda dar de baja a un médico).
- El canal en tiempo real (Socket.IO) también es público: cualquier cliente que se conecte recibe los eventos de los turnos.

Hay además dos condiciones del proyecto que limitan cualquier solución:

- No existe un modelo de usuarios ni de credenciales.
- Los datos se mantienen en memoria y se pierden al reiniciar, por lo que no hay dónde guardar usuarios de forma persistente.

La colección de Postman ya reserva una variable `token` en sus entornos, anticipando esta necesidad.

## Decisión

Se propone autenticar las solicitudes mediante **JSON Web Tokens (JWT)** con el esquema *Bearer*:

- Un endpoint de inicio de sesión (por ejemplo, `POST /auth/login`) validará las credenciales y emitirá un token firmado con un tiempo de expiración corto.
- El cliente enviará el token en el encabezado `Authorization: Bearer <token>` en cada solicitud.
- Un middleware en `src/middlewares` verificará la firma y la expiración antes de las rutas protegidas, y dejará la identidad del usuario disponible para los controladores.
- El token incluirá el rol del usuario para resolver la autorización (qué acciones puede realizar).
- La clave de firma se configurará mediante una variable de entorno (por ejemplo, `JWT_SECRET`) y nunca se incluirá en el repositorio.
- Las conexiones de Socket.IO enviarán el mismo token durante el *handshake*, y el servidor rechazará las conexiones sin un token válido.
- Al implementarse, OpenAPI declarará el esquema `bearerAuth` en `securitySchemes` y documentará las respuestas `401` y `403` en las rutas protegidas.

## Consecuencias

**Positivas:**

- El servidor no necesita guardar sesiones: cada token contiene la información necesaria para verificarlo, lo que encaja con el diseño sin estado de una API REST.
- Es un estándar ampliamente soportado por clientes web, móviles y otros servicios.
- El mismo token sirve para la API REST y para el canal de Socket.IO.
- Permite incorporar autorización por roles sin consultar una base de sesiones en cada solicitud.

**Negativas:**

- Un token emitido no puede revocarse fácilmente antes de su expiración. Mitigarlo requiere expiraciones cortas, *refresh tokens* o una lista de tokens revocados, lo que agrega complejidad.
- El contenido del token está firmado, pero no cifrado: no debe incluir datos sensibles.
- Requiere HTTPS en producción, porque un token interceptado permite suplantar al usuario hasta que expire.
- La seguridad depende de gestionar y rotar correctamente la clave de firma.
- Agrega dependencias (por ejemplo, `jsonwebtoken` y una biblioteca de hash de contraseñas) y nuevos casos de prueba.

## Alternativas consideradas

- **Sesiones con cookie en el servidor.** Son fáciles de revocar, pero obligan a guardar las sesiones en el servidor y se adaptan peor a clientes que no son navegadores, como otros servicios.
- **API keys estáticas.** Son simples para la comunicación entre servicios, pero no identifican a personas, no expiran por sí solas y no resuelven la autorización por roles.
- **OAuth 2.0 / OpenID Connect con un proveedor externo** (por ejemplo, Keycloak o Auth0). Es la opción más completa y delega la gestión de credenciales, pero resulta desproporcionada para la etapa actual del proyecto. Puede reconsiderarse si TurnosRed se integra con un sistema de identidad institucional; en ese caso, ese proveedor también emitiría tokens JWT.
- **Autenticación HTTP Basic.** Envía las credenciales en cada solicitud y solo es aceptable sobre HTTPS; no ofrece expiración ni roles. Se descarta.

## Limitaciones

- La decisión no puede implementarse mientras no exista un almacenamiento persistente de usuarios. Depende de resolver antes la persistencia de datos (actualmente en memoria), lo que debería registrarse en un ADR propio.
- JWT resuelve la identidad y transporta el rol, pero no define por sí solo la política de permisos: falta decidir qué roles existen y qué puede hacer cada uno.
- El análisis no cubre la gestión de contraseñas (recuperación, requisitos de complejidad) ni el registro de auditoría.

## Impacto sobre el proyecto

- **En la etapa actual: ninguno.** No se modifica el código. Por eso la especificación OpenAPI no declara `securitySchemes` (ver [ADR-001](./ADR-001-uso-de-openapi.md)).
- **Si se acepta e implementa:**
  - nuevos archivos: middleware de autenticación, rutas y controlador de `auth`, schema de Zod para el inicio de sesión y modelo de usuario;
  - `errorHandler`: nuevos códigos de error en el formato estándar, por ejemplo `UNAUTHORIZED` (401) y `FORBIDDEN` (403);
  - `.env.example`: nuevas variables, como `JWT_SECRET` y la duración del token;
  - Swagger: esquema `bearerAuth` y respuestas 401/403 en las rutas protegidas;
  - Postman: uso de la variable `token` ya reservada y nuevos casos de prueba sin token, con token expirado y con rol insuficiente;
  - Socket.IO: verificación del token en el *handshake*.
- **Criterio para pasar a Aceptado:** contar con persistencia de usuarios y definir los roles y permisos de la aplicación.
