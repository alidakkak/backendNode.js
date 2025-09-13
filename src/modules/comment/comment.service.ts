import type { FastifyInstance } from 'fastify';
import * as repo from './comment.repository';

type JwtUser = { id: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' };

export async function list(
  app: FastifyInstance,
  articleId: string,
  page: number,
  pageSize: number,
  current?: JwtUser,
) {
  const article = await app.prisma.article.findUnique({
    where: { id: articleId },
    include: { magazine: { select: { publisherId: true } }, author: { select: { id: true } } },
  });
  if (!article) throw new Error('NOT_FOUND');

  if (article.status !== 'PUBLISHED') {
    if (
      !current ||
      (current.role !== 'ADMIN' &&
        current.id !== article.magazine.publisherId &&
        current.id !== article.authorId)
    ) {
      throw new Error('FORBIDDEN');
    }
  }

  const [items, total] = await Promise.all([
    repo.listByArticle(app.prisma, articleId, page, pageSize),
    repo.countByArticle(app.prisma, articleId),
  ]);
  return { items, total, page, pageSize };
}

export async function add(app: FastifyInstance, articleId: string, current: JwtUser, body: string) {
  const article = await app.prisma.article.findUnique({
    where: { id: articleId },
    include: { magazine: true },
  });
  if (!article) throw new Error('NOT_FOUND');
  if (article.status !== 'PUBLISHED') throw new Error('FORBIDDEN');

  const c = await repo.create(app.prisma, { articleId, userId: current.id, body });
  return { id: c.id };
}

export async function remove(app: FastifyInstance, id: string, current: JwtUser) {
  const c = await repo.findWithOwnership(app.prisma, id);
  if (!c) throw new Error('NOT_FOUND');

  const isOwner = c.userId === current.id;
  const isMagOwner = c.article.magazine.publisherId === current.id;
  const isAdmin = current.role === 'ADMIN';
  if (!isOwner && !isMagOwner && !isAdmin) throw new Error('FORBIDDEN');

  await repo.remove(app.prisma, id);
  return { id };
}
