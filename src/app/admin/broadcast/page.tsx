"use client";

import { useState } from "react";
import { adminFetch } from "@/components/admin/useAdminData";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendBroadcast = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      const res = await adminFetch("/api/broadcasts", {
        method: "POST",
        body: JSON.stringify({ title, message }),
      });
      if (res.ok) {
        setTitle("");
        setMessage("");
        alert("Broadcast sent to all users");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Broadcast</h1>
          <p className="section-sub">Message all registered users</p>
        </div>
      </div>
      <div className="panel" style={{ padding: 24, maxWidth: 640 }}>
        <label className="field"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Message</span><textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
        <button type="button" className="btn btn-primary" onClick={sendBroadcast} disabled={sending}>
          {sending ? "Sending…" : "Send Broadcast"}
        </button>
      </div>
    </div>
  );
}
