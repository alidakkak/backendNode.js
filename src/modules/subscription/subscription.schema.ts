import { z } from 'zod';

export const MagIdParam = z.object({ magId: z.string().min(1) });
export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type MagIdParamT = z.infer<typeof MagIdParam>;
export type ListQueryT = z.infer<typeof ListQuery>;
