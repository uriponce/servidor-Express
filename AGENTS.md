# AGENTS.md — Kanban REST API (SDD Guidelines)

Este documento define la especificación contractual, límites arquitectónicos y directrices de implementación para agentes de IA que trabajen en este repositorio.

---

## 1. Stack Tecnológico y Entorno

- **Runtime:** Node.js (versión LTS actual, v20+)
- **Módulos:** ECMAScript Modules (`"type": "module"` en `package.json`)
- **Framework:** Express.js (v4.x o v5.x)
- **ODM:** Mongoose (v8.x)
- **Base de Datos:** MongoDB
- **Variables de Entorno:** `dotenv` (mantener `.env.example` sincronizado)
- **Herramienta de Testing:** Postman (`postman_collection.json`)

---

## 2. Arquitectura y Estructura de Directorios

Se exige separación estricta bajo el Principio de Responsabilidad Única. No se permite mezclar lógica de base de datos dentro de los routers.

```text
src/
├── config/
│   └── db.js                 # Conexión a MongoDB con Mongoose
├── models/
│   ├── Board.js              # Modelo y esquema de Tablero
│   ├── Column.js             # Modelo y esquema de Columna
│   └── Ticket.js             # Modelo y esquema de Ticket
├── controllers/
│   ├── boardController.js    # Controladores CRUD de Tableros
│   ├── columnController.js   # Controladores CRUD de Columnas
│   └── ticketController.js   # Controladores CRUD de Tickets
├── routes/
│   ├── boardRoutes.js        # Rutas base /api/boards y anidamiento
│   ├── columnRoutes.js       # Rutas anidadas de Columnas
│   └── ticketRoutes.js       # Rutas anidadas de Tickets
├── middlewares/
│   ├── validateObjectId.js   # Validación de ObjectId de MongoDB (24 hex)
│   ├── parentCheck.js        # Verificación de existencia y pertenencia jerárquica
│   └── errorHandler.js       # Manejador centralizado de errores
├── app.js                    # Configuración de Express y middlewares globales
└── server.js                 # Punto de entrada y listener del servidor
```

---

## 3. Contrato Estricto de Endpoints

Queda terminantemente prohibido utilizar rutas planas (ej. `/api/tickets` o `/api/columns`) para operaciones jerárquicas. Todo recurso debe crearse y consultarse dentro de su contexto padre.

| Método | Endpoint | Acción | Código de Éxito | Códigos de Error Comunes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/boards` | Crea un nuevo tablero. | `201 Created` | `400 Bad Request` |
| **GET** | `/api/boards/:boardId` | Obtiene un tablero con sus columnas pobladas. | `200 OK` | `400`, `404 Not Found` |
| **POST** | `/api/boards/:boardId/columns` | Agrega una columna a un tablero específico. | `201 Created` | `400`, `404 Not Found` |
| **DELETE** | `/api/boards/:boardId/columns/:columnId` | Elimina una columna y sus tickets en cascada. | `204 No Content` | `400`, `404 Not Found` |
| **POST** | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket dentro de una columna específica. | `201 Created` | `400`, `404 Not Found` |
| **PATCH** | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Actualiza contenido o mueve el ticket (`targetColumnId`). | `200 OK` | `400`, `404 Not Found` |

---

## 4. Reglas de Negocio y Validaciones Críticas

### 4.1. Verificación de Pertenencia y Existencia (Parent Check)
- Antes de crear una Columna, se debe verificar que `boardId` exista. Si no existe, responder `404 Not Found` inmediatamente (no `500` ni error no controlado de Mongoose).
- Antes de crear un Ticket, se debe verificar que `columnId` exista y pertenezca al `boardId` recibido.
- **Aislamiento de rutas anidadas:** Si la URL es `/api/boards/:boardId/columns/:columnId/tickets`, el middleware debe comprobar que la columna pertenezca efectivamente a ese tablero. Si la columna existe pero pertenece a otro tablero, retornar `400 Bad Request` o `404 Not Found`.

### 4.2. Borrado en Cascada Mediante Hooks
- El borrado en cascada se gestiona a nivel de modelo mediante middleware de Mongoose (`pre('deleteOne')`, `pre('findOneAndDelete')`):
  - Eliminar un `Board` debe disparar la eliminación de todas sus `Columns` y todos sus `Tickets`.
  - Eliminar una `Column` debe disparar la eliminación de todos sus `Tickets` asociados.
- **Límite:** No utilizar `findByIdAndDelete` sin asegurar la ejecución de los hooks correspondientes.

### 4.3. Idempotencia en Movimiento de Tickets (PATCH)
- El endpoint `PATCH` permite actualizar campos del ticket (título, descripción) o moverlo asignando un `targetColumnId`.
- Si se envía un `targetColumnId`, validar que dicha columna exista y pertenezca al mismo tablero.
- La operación debe ser idempotente: si la petición se repite con el mismo payload, el estado final del ticket en la base de datos debe ser idéntico sin provocar duplicaciones ni inconsistencias.

### 4.4. Formato de Errores y Semántica HTTP
Cualquier falla debe retornar un JSON directo con la propiedad `error`:
```json
{
  "error": "Mensaje explicativo del fallo"
}
```
- **`400 Bad Request`:**
  - Fallo en validación de payload (ej. campo requerido ausente).
  - ID que no cumple el formato de 24 caracteres hexadecimales de MongoDB (`ObjectId.isValid`).
  - Inconsistencia de jerarquía (ej. la columna no pertenece al tablero).
- **`404 Not Found`:**
  - El ID tiene formato válido pero el recurso padre o hijo no existe en la base de datos.
- **`500 Internal Server Error`:**
  - Excepciones no previstas capturadas por el middleware global de error.

---

## 5. Límites Negativos (Negative Boundaries)

1. **NO** utilizar arrays de subdocumentos embebidos para Tickets o Columnas si crecen indefinidamente; usar colecciones separadas con referencias `ObjectId` (`ref`).
2. **NO** devolver errores `500` genéricos por IDs inexistentes o malformados; capturar validaciones y responder con `400` o `404`.
3. **NO** crear rutas sin el middleware `mergeParams: true` en Express (necesario para acceder a los parámetros del router padre como `:boardId`).
4. **NO** escribir lógica de consulta a base de datos dentro de los controladores sin envolver en bloques `try/catch` o un helper `asyncHandler` hacia el middleware global.
5. **NO** omitir el archivo `.env.example` con las variables mínimas requeridas (`PORT`, `MONGODB_URI`).

---

## 6. Procedimiento de Ejecución SDD (Fases Paso a Paso)

El desarrollo asistido debe ejecutarse fase por fase, sin intentar generar todo el proyecto en un único paso:

1. **Fase 1 (Contrato de Pruebas):** Crear la colección Postman (`postman_collection.json`) con las carpetas y peticiones que reflejen la tabla de endpoints y casos de borde (IDs inválidos, padres inexistentes).
2. **Fase 2 (Modelos y Cascada):** Construir `Board.js`, `Column.js` y `Ticket.js` con esquemas tipados, referencias cruzadas y hooks de borrado en cascada (`pre`).
3. **Fase 3 (Middlewares de Validación):** Crear `validateObjectId` y `parentCheck` para interceptar las rutas antes de llegar a los controladores.
4. **Fase 4 (Controladores y Rutas Anidadas):** Implementar la lógica CRUD conectando routers anidados con `mergeParams: true`.
5. **Fase 5 (Verificación):** Ejecutar la colección de Postman contra el servidor local hasta que el 100% de las pruebas pasen en verde.