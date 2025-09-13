import type { FastifyInstance } from 'fastify';
import type { CreateBodyT, UpdateBodyT, ListQueryT } from './magazine.schema';
import * as repo from './magazine.repository';

type JwtUser = { id: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' };

export async function list(app: FastifyInstance, query: ListQueryT) {
  const [items, total] = await Promise.all([
    repo.listMagazines(app.prisma, query),
    repo.countMagazines(app.prisma, query.search),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getById(app: FastifyInstance, id: string) {
  return repo.findMagazineById(app.prisma, id);
}

export async function create(app: FastifyInstance, current: JwtUser, data: CreateBodyT) {
  return repo.createMagazine(app.prisma, { ...data, publisherId: current.id });
}

export async function update(
  app: FastifyInstance,
  current: JwtUser,
  id: string,
  data: UpdateBodyT,
) {
  const mag = await repo.findMagazineById(app.prisma, id);
  if (!mag) throw new Error('NOT_FOUND');
  if (current.role !== 'ADMIN' && mag.publisherId !== current.id) throw new Error('FORBIDDEN');
  return repo.updateMagazine(app.prisma, id, data);
}

export async function remove(app: FastifyInstance, current: JwtUser, id: string) {
  const mag = await repo.findMagazineById(app.prisma, id);
  if (!mag) throw new Error('NOT_FOUND');
  if (current.role !== 'ADMIN' && mag.publisherId !== current.id) throw new Error('FORBIDDEN');
  await repo.deleteMagazine(app.prisma, id);
  return { id };
}
