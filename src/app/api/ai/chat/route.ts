import { NextResponse } from "next/server";
import { askSiteAssistant } from "@/lib/openai";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "ai-chat", 20, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json();
    const question = String(body.question ?? "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!question || question.length > 2000) {
      return NextResponse.json({ error: "Enter a valid question." }, { status: 400 });
    }

    const answer = await askSiteAssistant(question, history);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("AI chat error:", err);
    const msg = err instanceof Error ? err.message : "AI unavailable";
    return NextResponse.json(
      { error: msg.includes("OPENAI") ? "AI assistant is not configured yet." : "Could not get an answer." },
      { status: 503 }
    );
  }
}
