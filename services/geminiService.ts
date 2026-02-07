
import { GoogleGenAI } from "@google/genai";
import { FIQH_PROMPT_TEMPLATE } from '../constants';
import type { FiqhStreamChunk, GroundingSource } from '../types';

export async function* getFiqhAnswer(question: string): AsyncGenerator<FiqhStreamChunk> {
  if (!process.env.API_KEY) {
    throw new Error("مفتاح API غير مهيأ. يرجى التأكد من إضافة API_KEY في إعدادات البيئة (Environment Variables) في Vercel.");
  }

  // تهيئة العميل داخل الدالة لضمان الوصول للمتغيرات في بيئة المتصفح/Vercel
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = FIQH_PROMPT_TEMPLATE.replace('{{USER_QUESTION}}', question);

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        thinkingConfig: { thinkingBudget: 16000 } // ميزانية تفكير لتحليل فقهي أعمق
      },
    });

    let sourcesFound = false;

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        yield { textChunk: text };
      }
      
      // استخراج المصادر من بيانات البحث
      const rawChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (rawChunks && rawChunks.length > 0) {
        const sources: GroundingSource[] = rawChunks.map((chunk: any) => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || ''
        })).filter((source: GroundingSource) => source.uri);
        
        if (sources.length > 0) {
          yield { sources };
          sourcesFound = true;
        }
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
      throw new Error("مفتاح API غير صالح. يرجى التحقق من المفتاح في إعدادات Vercel.");
    }
    throw error;
  }
}
