import type { FastifyPluginCallback } from 'fastify';
import { meHandler, updateMeHandler } from './user.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/me', { preHandler: [app.authenticate] }, (req, reply) => meHandler(app, req, reply));
  app.patch('/me', { preHandler: [app.authenticate] }, (req, reply) =>
    updateMeHandler(app, req, reply),
  );
  done();
};

export default routes;
