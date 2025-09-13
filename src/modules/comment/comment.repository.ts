import type { PrismaClient } from '@prisma/client';

export function listByArticle(
  prisma: PrismaClient,
  articleId: string,
  page: number,
  pageSize: number,
) {
  return prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      body: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });
}

export function countByArticle(prisma: PrismaClient, articleId: string) {
  return prisma.comment.count({ where: { articleId } });
}

export function create(
  prisma: PrismaClient,
  data: { articleId: string; userId: string; body: string },
) {
  return prisma.comment.create({ data, select: { id: true } });
}

export function findWithOwnership(prisma: PrismaClient, id: string) {
  return prisma.comment.findUnique({
    where: { id },
    include: { article: { include: { magazine: { select: { publisherId: true } } } } },
  });
}

export function remove(prisma: PrismaClient, id: string) {
  return prisma.comment.delete({ where: { id }, select: { id: true } });
}
