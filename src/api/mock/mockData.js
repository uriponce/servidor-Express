// Datos sintéticos que respetan la forma de las respuestas del backend (kanban-api).
// Sirven para desarrollar la UI sin servidor: VITE_USE_MOCKS=true

export const DEMO_USER = {
  _id: '64a000000000000000000001',
  name: 'Demo Dev',
  email: 'demo@kanban.dev',
  password: 'demo1234', // solo para el mock
};

const now = Date.now();
const iso = (minutesAgo) => new Date(now - minutesAgo * 60000).toISOString();

export const seedData = () => ({
  users: [{ ...DEMO_USER }],
  boards: [
    {
      _id: '64a000000000000000000010',
      title: 'Proyecto Web',
      description: 'Sprint 1 — landing y login',
      owner: DEMO_USER._id,
      createdAt: iso(600),
    },
    {
      _id: '64a000000000000000000011',
      title: 'Backlog personal',
      description: '',
      owner: DEMO_USER._id,
      createdAt: iso(300),
    },
  ],
  columns: [
    { _id: '64a000000000000000000020', title: 'Qué hacer', board: '64a000000000000000000010', createdAt: iso(590) },
    { _id: '64a000000000000000000021', title: 'En curso', board: '64a000000000000000000010', createdAt: iso(580) },
    { _id: '64a000000000000000000022', title: 'Hecho', board: '64a000000000000000000010', createdAt: iso(570) },
  ],
  tickets: [
    { _id: '64a000000000000000000030', title: 'Diseñar login', description: 'Wireframes y paleta', column: '64a000000000000000000020', createdAt: iso(500) },
    { _id: '64a000000000000000000031', title: 'Configurar CI', description: '', column: '64a000000000000000000020', createdAt: iso(490) },
    { _id: '64a000000000000000000032', title: 'Armar API de tableros', description: 'Rutas anidadas', column: '64a000000000000000000021', createdAt: iso(480) },
    { _id: '64a000000000000000000033', title: 'Elegir stack', description: 'React + Vite', column: '64a000000000000000000022', createdAt: iso(470) },
    { _id: '64a000000000000000000034', title: 'Probar rollback [fail]', description: 'Mover este ticket falla a propósito (UI optimista)', column: '64a000000000000000000020', createdAt: iso(460) },
  ],
});
