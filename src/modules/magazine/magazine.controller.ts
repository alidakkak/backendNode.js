import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateBody, UpdateBody, ListQuery, IdParam } from './magazine.schema';
import * as svc from './magazine.service';

export async function listHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const parsed = ListQuery.safeParse(req.query);
  if (!parsed.success) return reply.code(400).send({ message: parsed.error.message });
  const data = await svc.list(app, parsed.data);
  return reply.send(data);
}

export async function getHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: p.error.message });
  const mag = await svc.getById(app, p.data.id);
  return mag ? reply.send(mag) : reply.code(404).send({ message: 'Magazine not found' });
}

export async function createHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = CreateBody.safeParse(req.body);
  if (!body.success) return reply.code(400).send({ message: body.error.message });

  const mag = await svc.create(app, req.user as any, body.data);
  return reply.code(201).send(mag);
}

export async function updateHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: p.error.message });

  const body = UpdateBody.safeParse(req.body);
  if (!body.success) return reply.code(400).send({ message: body.error.message });

  try {
    const mag = await svc.update(app, req.user as any, p.data.id, body.data);
    return reply.send(mag);
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    if (e?.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Magazine not found' });
    return reply.code(400).send({ message: 'Update failed' });
  }
}

export async function deleteHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = IdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: p.error.message });

  try {
    const res = await svc.remove(app, req.user as any, p.data.id);
    return reply.send(res);
  } catch (e: any) {
    if (e?.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    if (e?.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Magazine not found' });
    return reply.code(400).send({ message: 'Delete failed' });
  }
}
