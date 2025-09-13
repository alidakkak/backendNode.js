import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ArticleIdParam, CommentIdParam, CreateBody, ListQuery } from './comment.schema';
import * as svc from './comment.service';

async function tryVerify(app: FastifyInstance, req: FastifyRequest) {
  try {
    await req.jwtVerify();
    return req.user as any;
  } catch {
    return undefined;
  }
}

export async function listHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const p = ArticleIdParam.safeParse(req.params);
  const q = ListQuery.safeParse(req.query);
  if (!p.success || !q.success) return reply.code(400).send({ message: 'Bad request' });

  const current = await tryVerify(app, req);
  try {
    const res = await svc.list(app, p.data.id, q.data.page, q.data.pageSize, current as any);
    return reply.send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Article not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Failed' });
  }
}

export async function addHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const p = ArticleIdParam.safeParse(req.params);
  const b = CreateBody.safeParse(req.body);
  if (!p.success || !b.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.add(app, p.data.id, req.user as any, b.data.body);
    return reply.code(201).send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Article not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Create failed' });
  }
}

export async function deleteHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const p = CommentIdParam.safeParse(req.params);
  if (!p.success) return reply.code(400).send({ message: 'Bad request' });

  try {
    const res = await svc.remove(app, p.data.id, req.user as any);
    return reply.send(res);
  } catch (e: any) {
    if (e.message === 'NOT_FOUND') return reply.code(404).send({ message: 'Comment not found' });
    if (e.message === 'FORBIDDEN') return reply.code(403).send({ message: 'Forbidden' });
    return reply.code(400).send({ message: 'Delete failed' });
  }
}
