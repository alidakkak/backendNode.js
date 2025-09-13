import type { FastifyPluginCallback } from 'fastify';
import { addHandler, deleteHandler, listHandler } from './comment.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/articles/:id/comments', (req, reply) => listHandler(app, req, reply));

  app.post('/articles/:id/comments', { preHandler: [app.authenticate] }, (req, reply) =>
    addHandler(app, req, reply),
  );

  app.delete('/comments/:id', { preHandler: [app.authenticate] }, (req, reply) =>
    deleteHandler(app, req, reply),
  );

  done();
};

export default routes;
