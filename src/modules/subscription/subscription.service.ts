import type { FastifyInstance } from 'fastify';
import { env } from '../../config/env';
import * as repo from './subscription.repository';

export async function subscribe(app: FastifyInstance, userId: string, magId: string) {
  const mag = await app.prisma.magazine.findUnique({ where: { id: magId }, select: { id: true } });
  if (!mag) throw new Error('NOT_FOUND');

  const now = new Date();
  const existing = await repo.findActive(app.prisma, userId, magId, now);
  if (existing) return { id: existing.id, alreadyActive: true };

  const end = new Date(now.getTime() + env.SUB_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const created = await repo.create(app.prisma, {
    userId,
    magazineId: magId,
    startAt: now,
    endAt: end,
  });
  return { id: created.id, alreadyActive: false };
}

export async function listMySubs(
  app: FastifyInstance,
  userId: string,
  page: number,
  pageSize: number,
) {
  const [items, total] = await Promise.all([
    repo.listMine(app.prisma, userId, page, pageSize),
    repo.countMine(app.prisma, userId),
  ]);
  return { items, total, page, pageSize };
}
