import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ListQuery, MagIdParam } from './subscription.schema';
import * as svc from './subscription.service';

export async function subscribeHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = MagIdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.subscribe(app, (req.user as any).id, p.data.magId);
    return reply.code(res.alreadyActive ? 200 : 201).send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Magazine not found' });
    return reply.code(400).send({ message: 'Subscribe failed' });
  }
}

export async function listMineHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const q = ListQuery.safeParse(req.query);
  if (!q.success) return reply.code(400).send({ message: 'Bad request' });

  const res = await svc.listMySubs(app, (req.user as any).id, q.data.page, q.data.pageSize);
  return reply.send(res);
}
