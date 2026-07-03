import { z } from 'zod';

export const ManuscriptStatusEnum = z.enum([
  'SUBMITTED',
  'SCORING',
  'REVIEW',
  'APPROVED',
  'REJECTED',
  'AWAITING_PAYMENT',
  'PAYMENT_FAILED',
  'PUBLISHING',
  'PUBLISHED',
]);

export const ManuscriptCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  subtitle: z.string().max(300).optional(),
  genre: z.string().min(1, 'Genre is required'),
  subgenre: z.string().optional(),
  blurb: z.string().max(2000).optional(),
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  ageCategory: z.string().optional(),
  contentWarnings: z.array(z.string()).optional(),
  // File upload metadata (returned from /api/upload)
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  coverImagePath: z.string().optional(),
  wordCount: z.number().int().positive(),
  rightsConfirmedAt: z.string().datetime(),
  rightsConfirmedIp: z.string().optional(),
});

export const ManuscriptUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  subtitle: z.string().max(300).optional(),
  genre: z.string().min(1).optional(),
  subgenre: z.string().optional(),
  blurb: z.string().max(2000).optional(),
  keywords: z.array(z.string()).optional(),
  ageCategory: z.string().optional(),
  contentWarnings: z.array(z.string()).optional(),
});

export const ManuscriptPublicSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  genre: z.string(),
  subgenre: z.string().nullable(),
  blurb: z.string().nullable(),
  keywords: z.array(z.string()),
  ageCategory: z.string().nullable(),
  contentWarnings: z.array(z.string()),
  wordCount: z.number(),
  score: z.number().nullable(),
  overallFeedback: z.string().nullable(),
  scoredAt: z.date().nullable(),
  status: ManuscriptStatusEnum,
  rightsConfirmedAt: z.date(),
  createdAt: z.date(),
  publishedAt: z.date().nullable(),
  publishedUrl: z.string().nullable(),
});

export const UploadResponseSchema = z.object({
  filePath: z.string(),
  fileName: z.string(),
  wordCount: z.number(),
  coverImagePath: z.string().optional(),
});

export const ScoreResultSchema = z.object({
  score: z.number(),
  dimensions: z.record(z.string(), z.number()),
  feedback: z.string(),
});

export type ManuscriptStatus = z.infer<typeof ManuscriptStatusEnum>;
export type ManuscriptCreate = z.infer<typeof ManuscriptCreateSchema>;
export type ManuscriptUpdate = z.infer<typeof ManuscriptUpdateSchema>;
export type ManuscriptPublic = z.infer<typeof ManuscriptPublicSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type ScoreResult = z.infer<typeof ScoreResultSchema>;
