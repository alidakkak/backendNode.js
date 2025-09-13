import type { PrismaClient } from '@prisma/client';

export function getUserById(prisma: PrismaClient, id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}

export function updateUserById(prisma: PrismaClient, id: string, data: { name?: string }) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
}
