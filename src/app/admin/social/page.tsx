"use client";

import { useAdminData } from "@/components/admin/useAdminData";

export default function AdminSocialPage() {
  const { data, loading } = useAdminData();

  if (loading) return <p className="section-sub">Loading social log…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Social Posts</h1>
          <p className="section-sub">Auto-post log when activities are published</p>
        </div>
      </div>
      {data && (
        <div>
          {data.socialPosts.length === 0 && <p className="section-sub">No social posts yet.</p>}
          {data.socialPosts.map((p) => (
            <div key={p.id} className="admin-card">
              <strong className="no-cap">{p.platform}</strong>, {p.status}
              {p.error_message && <p style={{ color: "var(--text-muted)" }}>{p.error_message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
