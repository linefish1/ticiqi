import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

// Initialize the default client only if the key is available
const defaultAi = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to get active custom LLM configuration
interface CustomLlmConfig {
  id: string;
  name: string;
  apiKey: string;
  endpoint?: string;
  model?: string;
}

const getActiveCustomLlm = (): CustomLlmConfig | null => {
  try {
    const saved = localStorage.getItem('zen_api_configs');
    if (saved) {
      const parsed = JSON.parse(saved);
      const active = parsed.find((c: any) => c.type === 'llm' && c.enabled && c.apiKey);
      if (active) {
        return {
          id: active.id,
          name: active.name,
          apiKey: active.apiKey,
          endpoint: active.endpoint,
          model: active.model
        };
      }
    }
  } catch (e) {
    console.error("加载自定义大模型配置时出错:", e);
  }
  return null;
};

// Generic LLM Client caller
const callLlmApi = async (prompt: string, fallbackModel = 'gemini-3-flash-preview'): Promise<string> => {
  const custom = getActiveCustomLlm();

  if (custom) {
    try {
      // 1. Google Gemini Custom KEY Mode
      if (custom.id === 'gemini_custom') {
        const endpoint = custom.endpoint || 'https://generativelanguage.googleapis.com';
        const model = custom.model || 'gemini-2.5-flash';
        const url = `${endpoint}/v1beta/models/${model}:generateContent?key=${custom.apiKey}`;
        
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Gemini[自定义] 调用失败(${resp.status}): ${errText}`);
        }

        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("模型响应中没有提取到文本");
      }

      // 2. OpenAI / DeepSeek / Kimi / GLM / Qwen Compatible Mode
      const endpoint = custom.endpoint || 'https://api.openai.com/v1';
      const model = custom.model || 'gpt-4o';
      const url = `${endpoint}/chat/completions`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${custom.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`${custom.name} 调用失败(${resp.status}): ${errText}`);
      }

      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text;
      throw new Error("模型未响应有效的文本内容");
    } catch (e: any) {
      console.error(`自定义大模型 ${custom.name} 运行错误，将尝试降级至系统默认模型:`, e);
      // Fall through to default fallback below
    }
  }

  // Fallback to default System Gemini client if no custom is active or if custom failed
  if (!defaultAi) {
    throw new Error("未检测到可用的 API Key。请在「API 接口配置」里设置您的 API 密钥。");
  }

  const response = await defaultAi.models.generateContent({
    model: fallbackModel,
    contents: prompt,
  });

  return response.text || "";
};

export const generateScript = async (topic: string, tone: string = 'professional'): Promise<string> => {
  try {
    const toneDescription = 
      tone === 'professional' ? '有逻辑、严谨、专业的讲师/学术风格' :
      tone === 'casual' ? '自然温和、对话式、轻松随意的聊天风格' :
      tone === 'funny' ? '幽默风趣、接地气、带有网梗的娱乐风格' :
      tone === 'urgent' ? '具有带货、促销、充满下单紧迫感和激情的口播风格' : '日常自然口播风格';

    const prompt = `你是一个专业的文案大师和金牌主播。请针对主题写一篇用于提词器的现场口播脚本，主题是："${topic}"。
    风格要求：${toneDescription}。
    创作细节：
    1. 句子要精简、好读，每句话字数尽量控制在20字以内。
    2. 口语化要强，不要有书面修饰，多用口头连词（所以、接着、那、重点来了 等）。
    3. 全文总长度控制在 250 至 350 字以内，字数适中。
    重要：只输出口播说话的内容（中文），绝对不要输出任何场景描述、分镜头动作或“[背景音乐]”、“[画面：麦克风]”之类的旁白指示。`;

    const text = await callLlmApi(prompt, 'gemini-3-flash-preview');
    return text || "抱歉，由于模型未能正常回应，未能为您生成脚本，请重试。";
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error("无法生成脚本。请检查您的 API 配置详情并重试。");
  }
};

export const polishScript = async (currentText: string): Promise<string> => {
  try {
    const prompt = `作为专业主播和文案纠错专家，请对以下提词文本进行口语化润色和节奏调整。
    
    润色规则：
    1. 长句拆短。如果一句话多于 20 字，拆分为更短的几句话，保持朗读平缓不憋气。
    2. 将生硬、书面词替换为高频的口头说话习惯词（如“因此”替换为“所以”，“然而”替换为“但是/不过”等）。
    3. 修复任何语病或不通顺的地方，确保朗读起来行云流水。
    4. 保持文本原本表达的中心主旨和意思绝对一致，只改善表达方式。
    
    待润色提词文本：
    ${currentText}
    
    请直接输出润色后的口语化文本，原文本里的格式换行也请保留。绝对不要输出任何带有解释、对比或分析性质的旁白。`;

    const text = await callLlmApi(prompt, 'gemini-3-flash-preview');
    return text || currentText;
  } catch (error) {
    console.error("Script Polish Error:", error);
    throw error;
  }
};
