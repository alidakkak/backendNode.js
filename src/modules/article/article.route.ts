import type { FastifyPluginCallback } from 'fastify';
import { requireRoles } from '../../core/middlewares/rbacGuard';
import {
  listPublicHandler,
  listManageHandler,
  createHandler,
  updateHandler,
  deleteHandler,
  getHandler,
} from './article.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/magazines/:magId/articles', (req, reply) => listPublicHandler(app, req, reply));

  const canManage = [app.authenticate, requireRoles('ADMIN', 'PUBLISHER')];
  app.get('/magazines/:magId/articles/manage', { preHandler: canManage }, (req, reply) =>
    listManageHandler(app, req, reply),
  );
  app.post('/magazines/:magId/articles', { preHandler: canManage }, (req, reply) =>
    createHandler(app, req, reply),
  );

  app.get('/articles/:id', (req, reply) => getHandler(app, req, reply));
  app.patch('/articles/:id', { preHandler: canManage }, (req, reply) =>
    updateHandler(app, req, reply),
  );
  app.delete('/articles/:id', { preHandler: canManage }, (req, reply) =>
    deleteHandler(app, req, reply),
  );

  done();
};

export default routes;
