import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminService } from './admin.service';
import { PageQuery, PatchUserBody } from './admin.schema';

export async function overviewHandler(
  app: FastifyInstance,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  const s = new AdminService(app);
  const data = await s.overview();
  return reply.send(data);
}

export async function listUsersHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const q = PageQuery.parse(req.query);
  const s = new AdminService(app);
  const data = await s.listUsers(q);
  return reply.send(data);
}

export async function patchUserHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const body = PatchUserBody.parse(req.body);
  const s = new AdminService(app);
  const res = await s.patchUser(id, body);
  return reply.send(res);
}
