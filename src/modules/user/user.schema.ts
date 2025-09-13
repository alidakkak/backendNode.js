import { z } from 'zod';

export const UpdateMeBody = z.object({
  name: z.string().min(2).optional(),
});
export type UpdateMeBodyT = z.infer<typeof UpdateMeBody>;
