import { z } from 'zod';

export const AuthorProfileSchema = z.object({
  penName: z.string().min(1, 'Pen name is required').max(100),
  bio: z.string().max(2000).optional(),
  genrePrefs: z.array(z.string()).min(1, 'At least one genre preference is required'),
});

export const AuthorPublicSchema = AuthorProfileSchema.extend({
  id: z.string(),
  createdAt: z.date(),
});

export const UpdateAuthorProfileSchema = AuthorProfileSchema.partial();

export type AuthorProfile = z.infer<typeof AuthorProfileSchema>;
export type AuthorPublic = z.infer<typeof AuthorPublicSchema>;
export type UpdateAuthorProfile = z.infer<typeof UpdateAuthorProfileSchema>;
