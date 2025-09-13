import type { FastifyPluginCallback } from 'fastify';
import { subscribeHandler, listMineHandler } from './subscription.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/magazines/:magId/subscribe', { preHandler: [app.authenticate] }, (req, reply) =>
    subscribeHandler(app, req, reply),
  );

  app.get('/subscriptions/me', { preHandler: [app.authenticate] }, (req, reply) =>
    listMineHandler(app, req, reply),
  );

  done();
};

export default routes;
