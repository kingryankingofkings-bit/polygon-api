// @app:user-owned — Zod contract for the manuscript scoring resource. Shared
// between the client (response parsing) and server (validation). No server-only
// imports — safe to import from anywhere.
import { z } from 'zod';

export const ScoreRequest = z.object({
  manuscript: z.string().min(100, 'Manuscript must be at least 100 characters'),
  genre: z.string().optional(),
});

export const ScoreDimension = z.object({
  name: z.string(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
});

export const ScoreResponse = z.object({
  score: z.number(),
  passed: z.boolean(),
  dimensions: z.array(ScoreDimension),
  overallFeedback: z.string(),
});

export type ScoreRequest = z.infer<typeof ScoreRequest>;
export type ScoreResponse = z.infer<typeof ScoreResponse>;
export type ScoreDimension = z.infer<typeof ScoreDimension>;
