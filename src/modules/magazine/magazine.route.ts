import type { FastifyPluginCallback } from 'fastify';
import {
  listHandler,
  getHandler,
  createHandler,
  updateHandler,
  deleteHandler,
} from './magazine.controller';
import { requireRoles } from '../../core/middlewares/rbacGuard';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/', (req, reply) => listHandler(app, req, reply));
  app.get('/:id', (req, reply) => getHandler(app, req, reply));

  const canManage = [app.authenticate, requireRoles('ADMIN')];

  app.post('/', { preHandler: canManage }, (req, reply) => createHandler(app, req, reply));
  app.patch('/:id', { preHandler: canManage }, (req, reply) => updateHandler(app, req, reply));
  app.delete('/:id', { preHandler: canManage }, (req, reply) => deleteHandler(app, req, reply));

  done();
};

export default routes;
