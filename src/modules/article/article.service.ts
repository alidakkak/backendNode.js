import type { FastifyInstance } from 'fastify';
import type { CreateBodyT, ListQueryT, UpdateBodyT } from './article.schema';
import * as repo from './article.repository';

type JwtUser = { id: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' };

async function ensureMagazineOwnerOrAdmin(app: FastifyInstance, magId: string, current: JwtUser) {
  const mag = await app.prisma.magazine.findUnique({
    where: { id: magId },
    select: { id: true, publisherId: true },
  });
  if (!mag) throw new Error('NOT_FOUND');
  if (current.role !== 'ADMIN' && mag.publisherId !== current.id) throw new Error('FORBIDDEN');
  return mag;
}

export async function listPublic(app: FastifyInstance, magId: string, query: ListQueryT) {
  const [items, total] = await Promise.all([
    repo.listPublishedByMagazine(app.prisma, { magId, ...query }),
    repo.countPublishedByMagazine(app.prisma, magId, query.search),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function listManage(
  app: FastifyInstance,
  magId: string,
  _current: JwtUser,
  query: ListQueryT,
) {
  const [items, total] = await Promise.all([
    repo.listAllByMagazine(app.prisma, { magId, ...query }),
    repo.countAllByMagazine(app.prisma, magId, query.search),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function create(
  app: FastifyInstance,
  magId: string,
  current: JwtUser,
  data: CreateBodyT,
) {
  // await ensureMagazineOwnerOrAdmin(app, magId, current);

  const publishedAt = data.status === 'PUBLISHED' ? new Date() : null;

  const article = await repo.createArticle(app.prisma, {
    title: data.title,
    summary: data.summary,
    content: data.content,
    status: data.status,
    magazineId: magId,
    authorId: current.id,
    publishedAt,
  });
  return { id: article.id };
}

export async function update(
  app: FastifyInstance,
  id: string,
  current: JwtUser,
  data: UpdateBodyT,
) {
  const a = await repo.findArticleWithMagazine(app.prisma, id);
  if (!a) throw new Error('NOT_FOUND');
  if (current.role !== 'ADMIN') throw new Error('FORBIDDEN');

  let publishedAt = a.publishedAt ?? null;
  if (data.status === 'PUBLISHED' && a.status !== 'PUBLISHED') publishedAt = new Date();
  if (data.status === 'DRAFT' && a.status !== 'DRAFT') publishedAt = null;

  const updated = await repo.updateArticle(app.prisma, id, { ...data, publishedAt });
  return { id: updated.id };
}

export async function remove(app: FastifyInstance, id: string, current: JwtUser) {
  const a = await repo.findArticleWithMagazine(app.prisma, id);
  if (!a) throw new Error('NOT_FOUND');
  if (current.role !== 'ADMIN' && a.magazine.publisherId !== current.id)
    throw new Error('FORBIDDEN');
  await repo.deleteArticle(app.prisma, id);
  return { id };
}

export async function getForRead(app: FastifyInstance, id: string, current?: JwtUser) {
  const a = await repo.findArticleWithMagazine(app.prisma, id);
  if (!a) throw new Error('NOT_FOUND');

  if (a.status !== 'PUBLISHED') {
    if (
      !current ||
      (current.role !== 'ADMIN' &&
        a.magazine.publisherId !== current.id &&
        a.authorId !== current.id)
    ) {
      throw new Error('FORBIDDEN');
    }
    return {
      article: {
        id: a.id,
        title: a.title,
        summary: a.summary ?? null,
        content: a.content,
        status: a.status,
        publishedAt: a.publishedAt,
        magazineId: a.magazineId,
      },
      access: 'FULL',
    };
  }

  let hasAccess = false;
  if (current) {
    if (
      current.role === 'ADMIN' ||
      a.magazine.publisherId === current.id ||
      a.authorId === current.id
    ) {
      hasAccess = true;
    } else {
      const now = new Date();
      const sub = await app.prisma.subscription.findFirst({
        where: {
          userId: current.id,
          magazineId: a.magazineId,
          startAt: { lte: now },
          endAt: { gte: now },
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      hasAccess = !!sub;
    }
  }

  return {
    article: {
      id: a.id,
      title: a.title,
      summary: a.summary ?? null,
      content: hasAccess ? a.content : undefined,
      status: a.status,
      publishedAt: a.publishedAt,
      magazineId: a.magazineId,
    },
    access: hasAccess ? 'FULL' : 'SUMMARY_ONLY',
  };
}
