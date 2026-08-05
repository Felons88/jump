/**
 * OpenRouter AI integration for admin business insights.
 *
 * Uses the OpenRouter Chat Completions API with a real API key from the
 * environment variable `VITE_OPENROUTER_API_KEY`. Never hardcode the key.
 *
 * In a production app this call should go through a server-side proxy to
 * avoid exposing the key in the browser. For this demo build we call it
 * client-side with the understanding that the key is scoped to the
 * OpenRouter dashboard's allowed domains.
 */

const OPENROUTER_KEY = import.meta.env["VITE_OPENROUTER_API_KEY"] as string | undefined;

export const hasOpenRouterKey = Boolean(OPENROUTER_KEY);

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function generateInsights(businessData: string): Promise<string> {
  if (!OPENROUTER_KEY) {
    return "AI insights are unavailable — add a VITE_OPENROUTER_API_KEY to enable this feature.";
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a smart business assistant for Jump City Inflatable Rentals, a party rental company in Minneapolis, MN. " +
        "Analyze the provided business data and generate plain-language insights about revenue trends, popular items, " +
        "underperforming inventory, marketing suggestions, and ad-spend recommendations. " +
        "Write in a friendly, professional tone. Use bullet points and clear sections. " +
        "Do not make up numbers — only reference the data provided.",
    },
    {
      role: "user",
      content: `Here is the current business data:\n\n${businessData}\n\nGenerate a concise business insights report.`,
    },
  ];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "https://jump-city-bounce-redesign.vercel.app",
        "X-Title": "Jump City Admin Dashboard",
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 800, temperature: 0.7 }),
    });

    if (!res.ok) throw new Error(`OpenRouter API returned ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in OpenRouter response");
    return content as string;
  } catch (err) {
    console.error("[openrouter] insights generation failed:", err);
    return "AI insights are temporarily unavailable. Please try again later.";
  }
}

export async function askFollowUp(businessData: string, question: string): Promise<string> {
  if (!OPENROUTER_KEY) {
    return "AI insights are unavailable — add a VITE_OPENROUTER_API_KEY to enable this feature.";
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a smart business assistant for Jump City Inflatable Rentals, a party rental company in Minneapolis, MN. " +
        "Answer the owner's follow-up question based on the provided business data. " +
        "Be concise, practical, and grounded in the data. Do not make up numbers.",
    },
    {
      role: "user",
      content: `Business data:\n${businessData}\n\nQuestion: ${question}`,
    },
  ];

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer":
          typeof window !== "undefined"
            ? window.location.origin
            : "https://jump-city-bounce-redesign.vercel.app",
        "X-Title": "Jump City Admin Dashboard",
      },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 500, temperature: 0.7 }),
    });

    if (!res.ok) throw new Error(`OpenRouter API returned ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in OpenRouter response");
    return content as string;
  } catch (err) {
    console.error("[openrouter] follow-up failed:", err);
    return "AI is temporarily unavailable. Please try again later.";
  }
}
