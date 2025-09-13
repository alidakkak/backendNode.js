import { FastifyReply, FastifyRequest } from 'fastify';

type Role = 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';

export function requireRoles(...allowed: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as any;
    if (!user || !allowed.includes(user.role)) {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  };
}
