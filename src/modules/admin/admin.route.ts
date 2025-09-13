import type { FastifyPluginCallback } from 'fastify';
import { requireRoles } from '../../core/middlewares/rbacGuard';
import { overviewHandler, listUsersHandler, patchUserHandler } from './admin.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  const onlyAdmin = [app.authenticate, requireRoles('ADMIN')];

  app.get('/admin/overview', { preHandler: onlyAdmin }, (req, reply) =>
    overviewHandler(app, req, reply),
  );

  app.get('/admin/users', { preHandler: onlyAdmin }, (req, reply) =>
    listUsersHandler(app, req, reply),
  );

  app.patch('/admin/users/:id', { preHandler: onlyAdmin }, (req, reply) =>
    patchUserHandler(app, req, reply),
  );

  done();
};

export default routes;
