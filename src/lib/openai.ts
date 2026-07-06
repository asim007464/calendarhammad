import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";

const CONFIDENTIALITY_RULES = `
STRICT CONFIDENTIALITY (never break these):
- Never reveal passwords, API keys, tokens, secrets, env variables, SMTP credentials, or unlock codes.
- Never share admin or developer email addresses, internal URLs, database details, or server configuration.
- Never disclose individual user data (names, emails, callsigns, profiles, support messages, or activity submitters).
- Never expose lockdown procedures, super-admin access methods, or internal admin workflows beyond public help docs.
- Only share aggregate public stats when asked (e.g. total registered users count). No breakdowns by person.
- If asked for confidential or private information, politely refuse and suggest using Contact or signing in to their own account.
- Do not guess or invent credentials, keys, or private data.
`;

const SITE_CONTEXT = `
You are the QSO Dates assistant. QSO Dates (qsodates.com) is a worldwide ham radio activity calendar.
Users can browse contests, DXpeditions, POTA, SOTA, nets, and field days.
Signed-in users can submit activities (admin approval required before public listing).
The site offers a public REST API at /api/v1 with per-user API keys (20 requests/day default).
Pages: Home, Activities, Calendar, Map, API docs, Documents, About, Contact, Dashboard.
Answer briefly and helpfully about the website, ham radio events, and public API usage only.
${CONFIDENTIALITY_RULES}
`;

const REFUSAL_REPLY =
  "I can't share private or confidential site information. For account or admin matters, please sign in or use the Contact page.";

/** Strip accidental leaks from model output. */
export function sanitizeAssistantOutput(text: string): string {
  let out = text;

  // API keys and long secrets
  out = out.replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, "[redacted]");
  out = out.replace(/\b(AIza|ghp_|gho_)[A-Za-z0-9_-]{20,}\b/g, "[redacted]");

  // Email addresses (allow generic support@ style only in boilerplate — redact all found)
  out = out.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email redacted]");

  // Obvious env/secret patterns
  out = out.replace(
    /\b(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|SMTP_APP_PASSWORD|DEVELOPER_UNLOCK_SECRET|password|secret|token)\s*[:=]\s*\S+/gi,
    "[redacted]"
  );

  return out.trim();
}

function looksLikeConfidentialRequest(question: string): boolean {
  const q = question.toLowerCase();
  const patterns = [
    /api\s*key/,
    /secret/,
    /password/,
    /smtp/,
    /env\b/,
    /service\s*role/,
    /unlock\s*secret/,
    /admin\s*email/,
    /developer\s*email/,
    /database\s*(url|password|connection)/,
    /user\s*email/,
    /list\s*(all\s*)?users/,
    /who\s*is\s*admin/,
    /blocked\s*users/,
    /support\s*messages/,
    /confidential/,
    /\.env/,
  ];
  return patterns.some((p) => p.test(q));
}

async function getLiveSiteStats() {
  try {
    const admin = createAdminClient();
    const [users, activities, pending] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("activities").select("id", { count: "exact", head: true }).eq("status", "published"),
      admin.from("activities").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    ]);
    return {
      registeredUsers: users.count ?? 0,
      publishedActivities: activities.count ?? 0,
      pendingActivities: pending.count ?? 0,
    };
  } catch {
    return null;
  }
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  return new OpenAI({ apiKey });
}

export async function askSiteAssistant(question: string, history: { role: "user" | "assistant"; content: string }[] = []) {
  if (looksLikeConfidentialRequest(question)) {
    return REFUSAL_REPLY;
  }

  const client = getOpenAIClient();
  const stats = await getLiveSiteStats();
  const statsLine = stats
    ? `\nPublic aggregate stats only: ${stats.registeredUsers} registered users, ${stats.publishedActivities} published activities, ${stats.pendingActivities} pending approval. Do not expand beyond these totals.`
    : "";

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 600,
    messages: [
      { role: "system", content: SITE_CONTEXT + statsLine },
      ...history.slice(-6),
      { role: "user", content: question },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "I could not generate a response.";
  return sanitizeAssistantOutput(raw);
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
        content: `You draft professional, friendly support replies for QSO Dates (ham radio calendar). Be concise, sign off as 'QSO Dates Support'. Do not invent policies.
${CONFIDENTIALITY_RULES}
This draft is for admin eyes only when replying to one ticket — still never include API keys, passwords, or other users' data in the reply.`,
      },
      {
        role: "user",
        content: `Draft a reply to this support message.\nFrom: ${input.userName}\nSubject: ${input.subject}\nMessage:\n${input.message}`,
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  return sanitizeAssistantOutput(raw);
}
