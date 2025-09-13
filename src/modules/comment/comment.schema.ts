import { z } from 'zod';

export const ArticleIdParam = z.object({ id: z.string().min(1) });
export const CommentIdParam = z.object({ id: z.string().min(1) });

export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const CreateBody = z.object({
  body: z.string().min(1),
});

export type ArticleIdParamT = z.infer<typeof ArticleIdParam>;
export type CommentIdParamT = z.infer<typeof CommentIdParam>;
export type ListQueryT = z.infer<typeof ListQuery>;
export type CreateBodyT = z.infer<typeof CreateBody>;
