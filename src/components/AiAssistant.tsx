"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about QSO Dates, ham radio events, or the API.",
    },
  ]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    const history = messages.filter((m) => m.role === "user" || m.role === "assistant");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer || data.error || "Sorry, I could not answer that." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="ai-fab" onClick={() => setOpen((v) => !v)} aria-label="Ask AI assistant">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {open && (
        <div className="ai-panel panel" role="dialog" aria-label="QSO Dates AI assistant">
          <div className="ai-panel-head">
            <strong>QSO Dates Assistant</strong>
            <span className="section-sub">Website and API help</span>
          </div>
          <div className="ai-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ai-msg--${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="ai-msg ai-msg--assistant">Thinking…</div>}
          </div>
          <form
            className="ai-input-row"
            onSubmit={(e) => { e.preventDefault(); send(); }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, API, calendar…"
              className="no-cap"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
