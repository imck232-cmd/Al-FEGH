
import { GoogleGenAI } from "@google/genai";
import { FIQH_PROMPT_TEMPLATE } from '../constants';
import type { FiqhStreamChunk, GroundingSource } from '../types';

export async function* getFiqhAnswer(question: string): AsyncGenerator<FiqhStreamChunk> {
  if (!process.env.API_KEY) {
    throw new Error("مفتاح API غير مهيأ. يرجى التأكد من إضافة API_KEY في إعدادات البيئة.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = FIQH_PROMPT_TEMPLATE.replace('{{USER_QUESTION}}', question);

  // نحاول أولاً استخدام الموديل الاحترافي Pro
  let modelName = "gemini-3-pro-preview";
  
  try {
    yield* streamFromModel(ai, modelName, prompt);
  } catch (error: any) {
    const errorMessage = error.message || "";
    
    // إذا كان الخطأ هو نفاذ الحصة للموديل Pro، نحاول استخدام Flash كخيار بديل أسرع وبحصة أكبر
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
      console.warn("Pro model quota exhausted, falling back to Flash model...");
      try {
        yield { textChunk: "> *ملاحظة: تم الانتقال للموديل السريع نظراً لتجاوز حصة الموديل الاحترافي حالياً.*\n\n" };
        yield* streamFromModel(ai, "gemini-3-flash-preview", prompt);
      } catch (fallbackError: any) {
        handleFinalError(fallbackError);
      }
    } else {
      handleFinalError(error);
    }
  }
}

async function* streamFromModel(ai: any, model: string, prompt: string): AsyncGenerator<FiqhStreamChunk> {
  const stream = await ai.models.generateContentStream({
    model: model,
    contents: prompt,
    config: {
      tools: [{googleSearch: {}}],
      // تقليل ميزانية التفكير قليلاً لتوفير التوكنات في الموديلات المجانية
      thinkingConfig: { thinkingBudget: model.includes("pro") ? 12000 : 0 }
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield { textChunk: chunk.text };
    }
    
    const rawChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (rawChunks && rawChunks.length > 0) {
      const sources: GroundingSource[] = rawChunks.map((c: any) => ({
          uri: c.web?.uri || '',
          title: c.web?.title || ''
      })).filter((s: GroundingSource) => s.uri);
      
      if (sources.length > 0) {
        yield { sources };
      }
    }
  }
}

function handleFinalError(error: any) {
  console.error("Gemini API Error:", error);
  const msg = error.message || "";
  
  if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("عذراً، لقد تجاوزت حصة الاستخدام المجانية المتاحة حالياً. يرجى الانتظار لمدة دقيقة قبل المحاولة مرة أخرى أو استخدام مفتاح API مدفوع.");
  }
  if (msg.includes("reported as leaked")) {
    throw new Error("تنبيه أمني: مفتاح API الخاص بك تم إيقافه لتسريبه. يرجى إنشاء مفتاح جديد.");
  }
  if (msg.includes("PERMISSION_DENIED")) {
    throw new Error("تم رفض الوصول. تأكد من تفعيل الفاتورة (Billing) للمشاريع الكبيرة أو صحة المفتاح.");
  }
  
  throw new Error("حدث خطأ في الاتصال. يرجى التحقق من جودة الإنترنت والمحاولة ثانية.");
}
