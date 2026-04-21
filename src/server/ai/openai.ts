/**
 * Minimal server-side OpenAI caller — no streaming, no client exposure.
 */

import 'server-only';

function requireApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return key;
}

export function resolveAiModel(): string {
  return process.env.BETALENT_AI_MODEL?.trim() || "gpt-4o-mini";
}

export async function completeChatText(params: {
  system: string;
  user: string;
}): Promise<string> {
  const key = requireApiKey();
  const model = resolveAiModel();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenAI request failed (${res.status}). ${errText.slice(0, 500)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty content.");
  }
  return content;
}

export async function completeChatJson(params: {
  system: string;
  user: string;
}): Promise<string> {
  const key = requireApiKey();
  const model = resolveAiModel();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenAI request failed (${res.status}). ${errText.slice(0, 500)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned empty JSON.");
  }
  return content;
}
