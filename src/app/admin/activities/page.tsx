"use client";

import { adminFetch, useAdminData } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/activity-utils";

export default function AdminActivitiesPage() {
  const { data, loading, refresh } = useAdminData();

  const deleteActivity = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    await adminFetch(`/api/activities/${id}`, { method: "DELETE" });
    refresh();
  };

  if (loading) return <p className="section-sub">Loading activities…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Activities</h1>
          <p className="section-sub">Manage calendar events</p>
        </div>
      </div>
      {data && (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Activity</th><th>Type</th><th>Callsign</th><th>Schedule</th><th></th></tr></thead>
            <tbody>
              {data.activities.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td>{a.type_name}</td>
                  <td className="no-cap">{a.callsign}</td>
                  <td className="no-cap">{fmtUTC(a.start_at)}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteActivity(a.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
