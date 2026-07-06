import OpenAI from "openai";

const SITE_CONTEXT = `
You are the QSO Dates assistant. QSO Dates (qsodates.com) is a worldwide ham radio activity calendar.
Users can browse contests, DXpeditions, POTA, SOTA, nets, and field days.
Signed-in users can submit activities (admin approval required before public listing).
The site offers a public REST API at /api/v1 with per-user API keys (20 requests/day default).
Pages: Home, Activities, Calendar, Map, API docs, Documents, About, Contact, Dashboard, Admin panel.
Answer briefly and helpfully about the website, ham radio events, and API usage.
`;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey });
}

export async function askSiteAssistant(question: string, history: { role: "user" | "assistant"; content: string }[] = []) {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 600,
    messages: [
      { role: "system", content: SITE_CONTEXT },
      ...history.slice(-6),
      { role: "user", content: question },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? "I could not generate a response.";
}

export async function suggestSupportReply(input: {
  subject: string;
  message: string;
  userName: string;
  email: string;
}) {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content:
          "You draft professional, friendly support replies for QSO Dates (ham radio calendar). Be concise, sign off as 'QSO Dates Support'. Do not invent policies.",
      },
      {
        role: "user",
        content: `Draft a reply to this support message.\nFrom: ${input.userName} <${input.email}>\nSubject: ${input.subject}\nMessage:\n${input.message}`,
      },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
