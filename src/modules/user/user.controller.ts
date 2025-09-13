import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UpdateMeBody } from './user.schema';
import { getMe, updateMe } from './user.service';

export async function meHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const user = await getMe(app, (req.user as any).id);
  return user ? reply.send(user) : reply.code(404).send({ message: 'User not found' });
}

export async function updateMeHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ message: parsed.error.message });

  const user = await updateMe(app, (req.user as any).id, parsed.data);
  return reply.send(user);
}
