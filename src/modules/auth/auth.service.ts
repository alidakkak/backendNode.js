import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { RegisterBodyT, LoginBodyT } from './auth.schema';

export async function registerUser(app: FastifyInstance, data: RegisterBodyT) {
  const exists = await app.prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await app.prisma.user.create({
    data: { email: data.email, name: data.name, role: data.role, passwordHash },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
}

export async function loginUser(app: FastifyInstance, data: LoginBodyT) {
  const user = await app.prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    createdAt: user.createdAt,
  };
  return safeUser;
}
