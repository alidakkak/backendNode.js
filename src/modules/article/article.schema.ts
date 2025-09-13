import { z } from 'zod';

export const IdParam = z.object({ id: z.string().min(1) });
export const MagIdParam = z.object({ magId: z.string().min(1) });

export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const CreateBody = z.object({
  title: z.string().min(3),
  summary: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('PUBLISHED'),
});

export const UpdateBody = z.object({
  title: z.string().min(3).optional(),
  summary: z.string().optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type IdParamT = z.infer<typeof IdParam>;
export type MagIdParamT = z.infer<typeof MagIdParam>;
export type ListQueryT = z.infer<typeof ListQuery>;
export type CreateBodyT = z.infer<typeof CreateBody>;
export type UpdateBodyT = z.infer<typeof UpdateBody>;
