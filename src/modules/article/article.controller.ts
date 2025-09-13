import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateBody, IdParam, ListQuery, MagIdParam, UpdateBody } from './article.schema';
import * as svc from './article.service';

async function tryVerify(app: FastifyInstance, req: FastifyRequest) {
  try {
    await req.jwtVerify();
    return req.user as any;
  } catch {
    return undefined;
  }
}

export async function listPublicHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = MagIdParam.safeParse(req.params);
  const q = ListQuery.safeParse(req.query);
  if (!p.success || !q.success) return reply.code(400).send({ message: 'Bad request' });

  const data = await svc.listPublic(app, p.data.magId, q.data);
  return reply.send(data);
}

export async function listManageHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = MagIdParam.safeParse(req.params);
  const q = ListQuery.safeParse(req.query);
  if (!p.success || !q.success) return reply.code(400).send({ message: 'Bad request' });

  const data = await svc.listManage(app, p.data.magId, req.user as any, q.data);
  return reply.send(data);
}

export async function createHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = MagIdParam.safeParse(req.params);
  const b = CreateBody.safeParse(req.body);
  if (!p.success || !b.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.create(app, p.data.magId, req.user as any, b.data);
    return reply.code(201).send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Magazine not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Create failed' });
  }
}

export async function updateHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = IdParam.safeParse(req.params);
  const b = UpdateBody.safeParse(req.body);
  if (!p.success || !b.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.update(app, p.data.id, req.user as any, b.data);
    return reply.send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Article not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Update failed' });
  }
}

export async function deleteHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.remove(app, p.data.id, req.user as any);
    return reply.send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Article not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Delete failed' });
  }
}

export async function getHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: 'Bad request' });

  const current = await tryVerify(app, req);
  try {
    const res = await svc.getForRead(app, p.data.id, current as any);
    return reply.send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Article not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Failed' });
  }
}
