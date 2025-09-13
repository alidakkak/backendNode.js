import type { PrismaClient } from '@prisma/client';
import tr from 'zod/v4/locales/tr.cjs';

export function findActive(prisma: PrismaClient, userId: string, magazineId: string, now: Date) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      magazineId,
      status: 'ACTIVE',
      startAt: { lte: now },
      endAt: { gte: now },
    },
  });
}

export function create(
  prisma: PrismaClient,
  data: {
    userId: string;
    magazineId: string;
    startAt: Date;
    endAt: Date;
  },
) {
  return prisma.subscription.create({ data: { ...data, status: 'ACTIVE' }, select: { id: true } });
}

export function listMine(prisma: PrismaClient, userId: string, page: number, pageSize: number) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      magazineId: true,
      startAt: true,
      endAt: true,
      status: true,
      createdAt: true,
      magazine: { select: { id: true, title: true } },
    },
  });
}

export function countMine(prisma: PrismaClient, userId: string) {
  return prisma.subscription.count({ where: { userId } });
}
