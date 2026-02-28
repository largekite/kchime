import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode: 'replies' | 'evaluate' | 'explain';
      apiKey: string;
      prompt?: string;
      context?: string;
      openingLine?: string;
      userReply?: string;
      text?: string;
    };

    const { mode, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required. Add yours in Settings.' }, { status: 401 });
    }

    const client = new Anthropic({ apiKey });

    if (mode === 'replies') {
      const { prompt, context } = body;
      if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

      const contextNote = context && context !== 'Any'
        ? `Context: ${context} setting.`
        : 'Context: general/any setting.';

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are an American English conversation coach helping non-native speakers respond naturally. Generate exactly 4 short, authentic replies to what someone said. Each reply must be under 20 words, use contractions, and sound like a real American would say it. Return ONLY valid JSON with this shape: {"replies":[{"tone":"Casual","text":"..."},{"tone":"Funny","text":"..."},{"tone":"Warm","text":"..."},{"tone":"Safe","text":"..."}]}. No markdown, no extra text.`,
        messages: [
          {
            role: 'user',
            content: `Someone said: "${prompt}"\n${contextNote}\n\nGenerate 4 replies (Casual, Funny, Warm, Safe).`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = JSON.parse(raw) as { replies: { tone: string; text: string }[] };
      return NextResponse.json(parsed);
    }

    if (mode === 'evaluate') {
      const { openingLine, userReply } = body;
      if (!openingLine || !userReply) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: `You are a warm, encouraging American English coach. Evaluate if a reply sounds natural in a casual American English conversation. Return ONLY valid JSON: {"natural":true/false,"feedback":"1-2 sentence warm feedback","suggestion":"optional better phrasing if not natural"}. No markdown.`,
        messages: [
          {
            role: 'user',
            content: `Opening: "${openingLine}"\nUser replied: "${userReply}"\n\nIs this natural American English? Give feedback.`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = JSON.parse(raw) as { natural: boolean; feedback: string; suggestion?: string };
      return NextResponse.json(parsed);
    }

    if (mode === 'explain') {
      const { text } = body;
      if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are an American English coach. Extract idioms, slang, and cultural references from the text. Return ONLY valid JSON: {"phrases":[{"phrase":"...","meaning":"simple meaning under 15 words","tip":"optional short usage tip"}]}. If no special phrases, return {"phrases":[]}. No markdown.`,
        messages: [
          {
            role: 'user',
            content: `Extract idioms, slang, and cultural references from: "${text}"`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = JSON.parse(raw) as { phrases: { phrase: string; meaning: string; tip?: string }[] };
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('401') || message.includes('api_key') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
