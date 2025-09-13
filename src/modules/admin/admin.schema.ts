import { z } from 'zod';

export const PageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const PatchUserBody = z.object({
  role: z.enum(['ADMIN', 'PUBLISHER', 'SUBSCRIBER']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
});

export type TPageQuery = z.infer<typeof PageQuery>;
export type TPatchUserBody = z.infer<typeof PatchUserBody>;
