import type { Prisma, PrismaClient } from '@prisma/client';

export type ListQueryT = {
  page: number;
  pageSize: number;
  search?: string;
};

function buildWhere(search?: string): Prisma.MagazineWhereInput {
  const s = typeof search === 'string' ? search.trim() : '';
  if (!s) return {};
  return {
    title: { contains: s }, // ⬅️ بدون mode
  };
}

export async function countMagazines(prisma: PrismaClient, search?: string) {
  const where = buildWhere(search);
  return prisma.magazine.count({ where });
}

export async function listMagazines(prisma: PrismaClient, q: ListQueryT) {
  const where = buildWhere(q.search);
  const skip = (q.page - 1) * q.pageSize;
  const take = q.pageSize;

  return prisma.magazine.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      createdAt: true,
    },
  });
}

export function findMagazineById(prisma: PrismaClient, id: string) {
  return prisma.magazine.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      publisherId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function createMagazine(
  prisma: PrismaClient,
  data: { title: string; description?: string; coverUrl?: string; publisherId: string },
) {
  return prisma.magazine.create({
    data,
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      publisherId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function updateMagazine(
  prisma: PrismaClient,
  id: string,
  data: { title?: string; description?: string; coverUrl?: string },
) {
  return prisma.magazine.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      publisherId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function deleteMagazine(prisma: PrismaClient, id: string) {
  return prisma.magazine.delete({
    where: { id },
    select: { id: true },
  });
}
