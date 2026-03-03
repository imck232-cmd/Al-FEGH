import { GoogleGenAI } from "@google/genai";
import { FIQH_PROMPT_TEMPLATE } from '../constants';
import type { FiqhStreamChunk, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function* getFiqhAnswer(question: string): AsyncGenerator<FiqhStreamChunk> {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured.");
  }

  const prompt = FIQH_PROMPT_TEMPLATE.replace('{{USER_QUESTION}}', question);

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
    },
  });

  let sourcesFound = false;

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      yield { textChunk: text };
    }
    
    // Grounding metadata often arrives in early chunks.
    // We check for it and yield it once.
    if (!sourcesFound) {
      const rawChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (rawChunks && rawChunks.length > 0) {
        const sources: GroundingSource[] = rawChunks.map((chunk: any) => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || ''
        })).filter((source: GroundingSource) => source.uri);
        
        if (sources.length > 0) {
          sourcesFound = true;
          yield { sources };
        }
      }
    }
  }
}