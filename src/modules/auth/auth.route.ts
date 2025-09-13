import type { FastifyPluginCallback } from 'fastify';
import { registerHandler, loginHandler } from './auth.controller';

const routes: FastifyPluginCallback = (app, _opts, done) => {
  app.post('/register', (req, reply) => registerHandler(app, req, reply));
  app.post('/login', (req, reply) => loginHandler(app, req, reply));
  done();
};

export default routes;
