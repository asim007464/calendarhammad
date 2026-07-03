"use client";

import { adminFetch, useAdminData } from "@/components/admin/useAdminData";

export default function AdminSupportPage() {
  const { data, loading, refresh } = useAdminData();

  const resolveSupport = async (id: string) => {
    await adminFetch("/api/support", {
      method: "PATCH",
      body: JSON.stringify({ id, status: "resolved" }),
    });
    refresh();
  };

  if (loading) return <p className="section-sub">Loading support…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Support</h1>
          <p className="section-sub">User support messages</p>
        </div>
      </div>
      {data && (
        <div>
          {data.support.length === 0 && <p className="section-sub">No support messages yet.</p>}
          {data.support.map((m) => (
            <div key={m.id} className="admin-card">
              <strong>{m.subject}</strong>
              <p className="section-sub no-cap">{m.user_name} · {m.callsign}</p>
              <p>{m.message}</p>
              {m.status === "open" && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolveSupport(m.id)}>
                  Resolve
                </button>
              )}
              {m.status === "resolved" && (
                <span className="section-sub">Resolved</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
