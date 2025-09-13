import type { PrismaClient } from '@prisma/client';

export function listPublishedByMagazine(
  prisma: PrismaClient,
  args: { magId: string; page: number; pageSize: number; search?: string },
) {
  const { magId, page, pageSize, search } = args;
  return prisma.article.findMany({
    where: {
      magazineId: magId,
      status: 'PUBLISHED',
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  });
}

export function countPublishedByMagazine(prisma: PrismaClient, magId: string, search?: string) {
  return prisma.article.count({
    where: {
      magazineId: magId,
      status: 'PUBLISHED',
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    },
  });
}

export function listAllByMagazine(
  prisma: PrismaClient,
  args: { magId: string; page: number; pageSize: number; search?: string },
) {
  const { magId, page, pageSize, search } = args;
  return prisma.article.findMany({
    where: {
      magazineId: magId,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function countAllByMagazine(prisma: PrismaClient, magId: string, search?: string) {
  return prisma.article.count({
    where: {
      magazineId: magId,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
    },
  });
}

export function findArticleWithMagazine(prisma: PrismaClient, id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      magazine: { select: { id: true, publisherId: true } },
      author: { select: { id: true } },
    },
  });
}

export function createArticle(
  prisma: PrismaClient,
  data: {
    title: string;
    summary?: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED';
    magazineId: string;
    authorId: string;
    publishedAt?: Date | null;
  },
) {
  return prisma.article.create({ data });
}

export function updateArticle(
  prisma: PrismaClient,
  id: string,
  data: Partial<{
    title: string;
    summary?: string | null;
    content: string;
    status: 'DRAFT' | 'PUBLISHED';
    publishedAt?: Date | null;
  }>,
) {
  return prisma.article.update({ where: { id }, data });
}

export function deleteArticle(prisma: PrismaClient, id: string) {
  return prisma.article.delete({ where: { id }, select: { id: true } });
}
