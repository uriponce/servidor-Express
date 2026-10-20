import { AxiosError } from 'axios';
import { seedData } from './mockData';

// Adaptador HTTP en memoria: imita el contrato del backend (rutas, códigos y { error }).
// Los datos viven mientras la pestaña esté abierta. Latencia simulada para ver spinners.

const LATENCY_MS = 300;
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const newId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

class MockHttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new MockHttpError(status, message);
};

export function createMockAdapter() {
  const db = seedData();

  const tokenFor = (user) => `mock-token-${user._id}`;
  const publicUser = ({ password, ...rest }) => rest; // eslint-disable-line no-unused-vars

  const requireUser = (config) => {
    const header = config.headers?.Authorization ?? config.headers?.get?.('Authorization') ?? '';
    const token = String(header).replace('Bearer ', '');
    const user = db.users.find((u) => tokenFor(u) === token);
    if (!user) fail(401, 'Autenticación requerida');
    return user;
  };

  const checkId = (value, name) => {
    if (!OBJECT_ID.test(value)) fail(400, `El parámetro ${name} no es un ObjectId válido`);
  };

  const loadBoard = (user, boardId) => {
    checkId(boardId, 'boardId');
    const board = db.boards.find((b) => b._id === boardId && b.owner === user._id);
    if (!board) fail(404, 'Tablero no encontrado');
    return board;
  };

  const loadColumn = (board, columnId) => {
    checkId(columnId, 'columnId');
    const column = db.columns.find((c) => c._id === columnId);
    if (!column) fail(404, 'Columna no encontrada');
    if (column.board !== board._id) fail(404, 'La columna no pertenece a este tablero');
    return column;
  };

  const requireTitle = (title, label, max) => {
    if (typeof title !== 'string' || !title.trim()) fail(400, `El título de${label} es obligatorio`);
    if (title.trim().length > max) fail(400, `El título no puede superar los ${max} caracteres`);
    return title.trim();
  };

  const boardWithTree = (board) => ({
    ...board,
    columns: db.columns
      .filter((c) => c.board === board._id)
      .map((c) => ({ ...c, tickets: db.tickets.filter((t) => t.column === c._id) })),
  });

  // Devuelve [status, data]
  function handle(config) {
    const method = config.method.toLowerCase();
    const path = config.url.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '');
    const parts = path.split('/'); // ej: ['boards', id, 'columns', id, 'tickets', id]
    const body = config.data ? JSON.parse(config.data) : {};

    // ---- Auth ----
    if (parts[0] === 'auth') {
      if (method === 'post' && parts[1] === 'register') {
        const { name, email, password } = body;
        if (typeof password !== 'string' || password.length < 6)
          fail(400, 'La contraseña debe tener al menos 6 caracteres');
        if (db.users.some((u) => u.email === String(email).trim().toLowerCase()))
          fail(409, 'Ya existe una cuenta con ese email');
        if (!name?.trim()) fail(400, 'El nombre es obligatorio');
        if (!/^\S+@\S+\.\S+$/.test(email ?? '')) fail(400, 'El email no es válido');
        const user = { _id: newId(), name: name.trim(), email: email.trim().toLowerCase(), password };
        db.users.push(user);
        return [201, { token: tokenFor(user), user: publicUser(user) }];
      }
      if (method === 'post' && parts[1] === 'login') {
        const user = db.users.find((u) => u.email === String(body.email).trim().toLowerCase());
        if (!user || user.password !== body.password) fail(401, 'Email o contraseña incorrectos');
        return [200, { token: tokenFor(user), user: publicUser(user) }];
      }
      if (method === 'get' && parts[1] === 'me') {
        return [200, { user: publicUser(requireUser(config)) }];
      }
      fail(404, 'Ruta no encontrada');
    }

    // ---- Boards (protegido) ----
    if (parts[0] !== 'boards') fail(404, 'Ruta no encontrada');
    const user = requireUser(config);

    if (parts.length === 1) {
      if (method === 'get')
        return [200, db.boards.filter((b) => b.owner === user._id).slice().reverse()];
      if (method === 'post') {
        const board = {
          _id: newId(),
          title: requireTitle(body.title, 'l tablero', 100),
          description: (body.description ?? '').trim(),
          owner: user._id,
          createdAt: new Date().toISOString(),
        };
        db.boards.push(board);
        return [201, board];
      }
    }

    const board = loadBoard(user, parts[1]);

    if (parts.length === 2) {
      if (method === 'get') return [200, boardWithTree(board)];
      if (method === 'delete') {
        const colIds = db.columns.filter((c) => c.board === board._id).map((c) => c._id);
        db.tickets = db.tickets.filter((t) => !colIds.includes(t.column));
        db.columns = db.columns.filter((c) => c.board !== board._id);
        db.boards = db.boards.filter((b) => b._id !== board._id);
        return [204, undefined];
      }
    }

    if (parts[2] === 'columns') {
      if (parts.length === 3 && method === 'post') {
        const column = {
          _id: newId(),
          title: requireTitle(body.title, ' la columna', 100),
          board: board._id,
          createdAt: new Date().toISOString(),
        };
        db.columns.push(column);
        return [201, column];
      }
      if (parts.length === 4 && method === 'delete') {
        const column = loadColumn(board, parts[3]);
        db.tickets = db.tickets.filter((t) => t.column !== column._id);
        db.columns = db.columns.filter((c) => c._id !== column._id);
        return [204, undefined];
      }
      if (parts[4] === 'tickets') {
        const column = loadColumn(board, parts[3]);

        if (parts.length === 5 && method === 'post') {
          const ticket = {
            _id: newId(),
            title: requireTitle(body.title, 'l ticket', 150),
            description: (body.description ?? '').trim(),
            column: column._id,
            createdAt: new Date().toISOString(),
          };
          db.tickets.push(ticket);
          return [201, ticket];
        }

        if (parts.length === 6) {
          checkId(parts[5], 'ticketId');

          if (method === 'delete') {
            const ticket = db.tickets.find((t) => t._id === parts[5] && t.column === column._id);
            if (!ticket) fail(404, 'Ticket no encontrado en esta columna');
            db.tickets = db.tickets.filter((t) => t._id !== ticket._id);
            return [204, undefined];
          }

          if (method === 'patch') {
            const updates = {};
            for (const f of ['title', 'description', 'column']) if (body[f] !== undefined) updates[f] = body[f];
            if (!Object.keys(updates).length)
              fail(400, 'Debe enviar al menos uno de estos campos: title, description, column');
            if (updates.title !== undefined) updates.title = requireTitle(updates.title, 'l ticket', 150);

            const allowed = [column._id];
            if (updates.column !== undefined) {
              if (!OBJECT_ID.test(updates.column)) fail(400, 'column no es un ObjectId válido');
              const target = db.columns.find((c) => c._id === updates.column);
              if (!target) fail(404, 'Columna destino no encontrada');
              if (target.board !== board._id) fail(400, 'La columna destino pertenece a otro tablero');
              allowed.push(target._id);
            }
            const ticket = db.tickets.find((t) => t._id === parts[5] && allowed.includes(t.column));
            if (!ticket) fail(404, 'Ticket no encontrado en esta columna');
            // Fallo a propósito para poder probar el rollback de la UI optimista
            if (updates.column !== undefined && ticket.title.includes('[fail]'))
              fail(400, 'Movimiento rechazado por el servidor (simulado)');
            Object.assign(ticket, updates);
            return [200, ticket];
          }
        }
      }
    }
    return fail(404, 'Ruta no encontrada');
  }

  // Interfaz de adaptador de Axios: recibe config, devuelve Promise<response>
  return (config) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const [status, data] = handle(config);
          resolve({ data, status, statusText: 'OK', headers: {}, config, request: {} });
        } catch (err) {
          if (!(err instanceof MockHttpError)) {
            reject(err);
            return;
          }
          const response = { data: { error: err.message }, status: err.status, statusText: 'Error', headers: {}, config };
          reject(new AxiosError(err.message, AxiosError.ERR_BAD_REQUEST, config, {}, response));
        }
      }, LATENCY_MS);
    });
}
