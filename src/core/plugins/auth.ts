import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../../config/env';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { id: string; email: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: import('fastify').preHandlerHookHandler;
  }
}

export default fp(async (app) => {
  app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  });
});
