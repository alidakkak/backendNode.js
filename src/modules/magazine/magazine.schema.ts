import { z } from 'zod';

export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const IdParam = z.object({
  id: z.string().min(1),
});

export const CreateBody = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
});

export const UpdateBody = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
});

export type ListQueryT = z.infer<typeof ListQuery>;
export type IdParamT = z.infer<typeof IdParam>;
export type CreateBodyT = z.infer<typeof CreateBody>;
export type UpdateBodyT = z.infer<typeof UpdateBody>;
