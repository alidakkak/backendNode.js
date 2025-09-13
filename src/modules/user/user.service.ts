import type { FastifyInstance } from 'fastify';
import { UpdateMeBodyT } from './user.schema';
import { getUserById, updateUserById } from './user.repository';

export async function getMe(app: FastifyInstance, userId: string) {
  return getUserById(app.prisma, userId);
}

export async function updateMe(app: FastifyInstance, userId: string, data: UpdateMeBodyT) {
  return updateUserById(app.prisma, userId, { name: data.name });
}
