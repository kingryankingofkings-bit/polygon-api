// @app:user-owned — manuscript scoring endpoint. POST only. Validates the
// request body, runs AI scoring, returns a validated ScoreResponse.
import 'server-only';
import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai/client';
import { ScoreRequest, ScoreResponse } from '@/lib/contracts/score';

export const dynamic = 'force-dynamic';

function buildScoringPrompt(manuscript: string, genre?: string): string {
  const genreContext = genre ? `The author has identified the genre as: ${genre}.` : '';
  return `You are an expert literary analyst evaluating a manuscript submission.

${genreContext}

Evaluate the manuscript on exactly five dimensions. For each dimension, provide:
1. A score from 0 to 10 (integer or one decimal place)
2. A single concise sentence of feedback

The five dimensions are:
- Genre Fit: Does the manuscript align with genre expectations and conventions? Are tropes handled skillfully?
- Marketability: Is there a clear audience, comp titles, and commercial appeal? Does the concept feel salable?
- Structure: Is there a coherent narrative arc with a beginning, middle, and end? Are chapters and scenes well-crafted?
- Pacing: Does the story move at an appropriate speed? Are there slow passages or rushed endings?
- Prose Quality: Is the writing polished, evocative, and grammatically sound? Are there awkward constructions?

Return your response as a JSON object with exactly this structure:
{
  "score": <number between 0-10>,
  "passed": <boolean, true if score >= 8.5>,
  "dimensions": [
    {"name": "Genre Fit", "score": <number>, "feedback": "<single sentence>"},
    {"name": "Marketability", "score": <number>, "feedback": "<single sentence>"},
    {"name": "Structure", "score": <number>, "feedback": "<single sentence>"},
    {"name": "Pacing", "score": <number>, "feedback": "<single sentence>"},
    {"name": "Prose Quality", "score": <number>, "feedback": "<single sentence>"}
  ],
  "overallFeedback": "<2-3 sentences summarizing the manuscript's strengths and areas for improvement>"
}

Manuscript to evaluate:
---
${manuscript.slice(0, 8000)}
---`;
}

export async function POST(req: Request) {
  try {
    const parsed = ScoreRequest.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        const message = messages?.[0];
        if (message) errors[field] = message;
      }
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { manuscript, genre } = parsed.data;

    const raw = await chat({
      task: 'manuscript-scoring',
      responseFormat: 'json_object',
      messages: [{ role: 'user', content: buildScoringPrompt(manuscript, genre) }],
    });

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 502 });
    }

    const validated = ScoreResponse.parse(data);
    return NextResponse.json(validated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
