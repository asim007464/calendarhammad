"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSent: () => void;
}

export function SupportModal({ onClose, onSent }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: fd.get("subject"),
        message: fd.get("message"),
        user_name: fd.get("name"),
        callsign: fd.get("callsign"),
        email: fd.get("email"),
      }),
    });
    setLoading(false);
    if (res.ok) { onSent(); onClose(); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="modal-eyebrow">Customer Support</p>
            <h2>Contact Support</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid2">
              <label className="field">
                <span>Name</span>
                <input name="name" required />
              </label>
              <label className="field">
                <span>Callsign</span>
                <input name="callsign" className="no-cap" />
              </label>
            </div>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" className="no-cap" />
            </label>
            <label className="field">
              <span>Subject *</span>
              <input name="subject" required />
            </label>
            <label className="field">
              <span>Message *</span>
              <textarea name="message" rows={4} required />
            </label>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
