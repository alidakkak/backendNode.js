import Fastify from 'fastify';
import cors from '@fastify/cors';

import prismaPlugin from './core/plugins/prisma';
import authPlugin from './core/plugins/auth';
import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/user/user.route';
import magazineRoutes from './modules/magazine/magazine.route';
import articleRoutes from './modules/article/article.route';
import subscriptionRoutes from './modules/subscription/subscription.route';
import commentRoutes from './modules/comment/comment.route';
import adminRoute from './modules/admin/admin.route';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.register(prismaPlugin);
  app.register(authPlugin);

  app.get('/health', async () => ({ ok: true, uptime: process.uptime() }));

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(magazineRoutes, { prefix: '/api/magazines' });
  app.register(articleRoutes, { prefix: '/api' });
  app.register(subscriptionRoutes, { prefix: '/api' });
  app.register(commentRoutes, { prefix: '/api' });
  app.register(adminRoute, { prefix: '/api' });

  return app;
}
