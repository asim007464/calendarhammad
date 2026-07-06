"use client";

import { useState } from "react";
import { adminFetch, useAdminData } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/activity-utils";

export default function AdminSupportPage() {
  const { data, loading, refresh } = useAdminData();
  const [busyId, setBusyId] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const resolveSupport = async (id: string, reply?: string) => {
    setBusyId(id);
    await adminFetch("/api/support", {
      method: "PATCH",
      body: JSON.stringify({ id, status: "resolved", reply: reply || undefined }),
    });
    await refresh();
    setBusyId("");
  };

  const suggestReply = async (id: string) => {
    setBusyId(id);
    const res = await adminFetch("/api/ai/support-suggest", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (res.ok && result.suggestion) {
      setReplyDraft((d) => ({ ...d, [id]: result.suggestion }));
    } else {
      alert(result.error || "AI suggestion failed");
    }
    await refresh();
    setBusyId("");
  };

  if (loading) return <p className="section-sub">Loading support…</p>;

  const openCount = data?.support.filter((s) => s.status === "open").length ?? 0;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Support</h1>
          <p className="section-sub">User contact messages. {openCount} open.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={refresh}>Refresh</button>
      </div>
      {data && (
        <div className="admin-support-list">
          {data.support.length === 0 && <p className="section-sub">No support messages yet.</p>}
          {data.support.map((m) => (
            <div key={m.id} className="admin-card">
              <div className="admin-card-head">
                <strong>{m.subject}</strong>
                <span className={`support-status support-status--${m.status}`}>{m.status}</span>
              </div>
              <p className="section-sub no-cap">
                {m.user_name}
                {m.callsign ? `, ${m.callsign}` : ""}
                {m.email ? `, ${m.email}` : ""}
                {", "}
                {fmtUTC(m.created_at)}
              </p>
              <p className="support-message-body">{m.message}</p>

              {(m.ai_suggested_reply || replyDraft[m.id]) && (
                <div className="admin-ai-suggestion">
                  <strong>AI suggested reply</strong>
                  <p>{replyDraft[m.id] || m.ai_suggested_reply}</p>
                </div>
              )}

              {m.status === "open" && (
                <div className="admin-panel-actions">
                  <button type="button" className="btn btn-outline btn-sm" disabled={busyId === m.id} onClick={() => suggestReply(m.id)}>
                    {busyId === m.id ? "Generating…" : "AI suggest reply"}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === m.id} onClick={() => resolveSupport(m.id, replyDraft[m.id] || m.ai_suggested_reply)}>
                    Mark resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
