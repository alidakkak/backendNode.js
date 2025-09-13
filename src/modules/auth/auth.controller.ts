import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { RegisterBody, LoginBody } from './auth.schema';
import { registerUser, loginUser } from './auth.service';

export async function registerHandler(
  app: FastifyInstance,
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ message: parsed.error.message });

  try {
    const user = await registerUser(app, parsed.data);
    const token = app.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '1d' },
    );
    return reply.code(201).send({ user, token });
  } catch (e: any) {
    const msg = e?.message || 'Registration failed';
    const code = msg.includes('already in use') ? 409 : 400;
    return reply.code(code).send({ message: msg });
  }
}

export async function loginHandler(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return reply.code(400).send({ message: parsed.error.message });

  try {
    const user = await loginUser(app, parsed.data);
    const token = app.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '1d' },
    );
    return reply.send({ user, token });
  } catch (e: any) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }
}
