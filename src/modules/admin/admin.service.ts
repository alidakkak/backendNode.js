import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { PageQuery, PatchUserBody, type TPageQuery, type TPatchUserBody } from './admin.schema';

export class AdminService {
  constructor(private app: FastifyInstance) {}

  async overview() {
    const [users, magazines, articles, activeSubs] = await Promise.all([
      this.app.prisma.user.count(),
      this.app.prisma.magazine.count(),
      this.app.prisma.article.count(),
      this.app.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { users, magazines, articles, activeSubs };
  }

  async listUsers(q: TPageQuery) {
    const search = typeof q.search === 'string' ? q.search.trim() : '';

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [{ email: { contains: search } }, { name: { contains: search } }],
        }
      : {};

    const [items, total] = await Promise.all([
      this.app.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      this.app.prisma.user.count({ where }),
    ]);

    return { items, total, page: q.page, pageSize: q.pageSize };
  }

  async patchUser(id: string, body: TPatchUserBody) {
    const data: Prisma.UserUpdateInput = {};
    if (body.role) data.role = body.role as any;
    if (body.status) data.status = body.status as any;

    const updated = await this.app.prisma.user.update({
      where: { id },
      data,
      select: { id: true },
    });
    return { id: updated.id };
  }
}
