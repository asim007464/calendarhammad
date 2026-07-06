"use client";

import { useMemo, useState } from "react";
import { adminFetch, useAdminData } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/activity-utils";

const PER_PAGE = 12;

export default function AdminActivitiesPage() {
  const { data, loading, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState("");

  const types = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.activities.map((a) => a.type_name).filter(Boolean))).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.activities.filter((a) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.callsign?.toLowerCase().includes(q) ||
        a.profiles?.email?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      const matchesType = typeFilter === "all" || a.type_name === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [data, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function reviewActivity(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await adminFetch(`/api/admin/activities/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
    await refresh();
    setBusyId("");
  }

  async function deleteActivity(id: string) {
    if (!confirm("Delete this activity permanently?")) return;
    setBusyId(id);
    await adminFetch(`/api/activities/${id}`, { method: "DELETE" });
    await refresh();
    setBusyId("");
  }

  if (loading) return <p className="section-sub">Loading activities…</p>;

  const pending = data?.stats.pendingActivities ?? 0;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Activities</h1>
          <p className="section-sub">
            {pending > 0 ? `${pending} submissions waiting for approval.` : "Manage and approve calendar events."}
          </p>
        </div>
      </div>

      <div className="admin-filters panel">
        <input
          className="admin-filter-input no-cap"
          placeholder="Search activity, callsign, submitter…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="all">All statuses</option>
          <option value="pending_review">Pending review</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="all">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {data && (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Type</th>
                <th>Callsign</th>
                <th>Submitter</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((a) => (
                <tr key={a.id} className={a.status === "pending_review" ? "admin-row-pending" : ""}>
                  <td>{a.name}</td>
                  <td>{a.type_name}</td>
                  <td className="no-cap">{a.callsign}</td>
                  <td className="no-cap">{a.profiles?.name || a.profiles?.email || "—"}</td>
                  <td className="no-cap">{fmtUTC(a.start_at)}</td>
                  <td>
                    <span className={`support-status support-status--${a.status === "published" ? "resolved" : "open"}`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="no-cap">{a.created_at ? fmtUTC(a.created_at) : "—"}</td>
                  <td className="admin-actions-cell">
                    {a.status === "pending_review" && (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" disabled={busyId === a.id} onClick={() => reviewActivity(a.id, "approve")}>Approve</button>
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === a.id} onClick={() => reviewActivity(a.id, "reject")}>Reject</button>
                      </>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" disabled={busyId === a.id} onClick={() => deleteActivity(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pagination">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
