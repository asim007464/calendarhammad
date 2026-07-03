"use client";

import { useAdminData } from "@/components/admin/useAdminData";

export default function AdminUsersPage() {
  const { data, loading } = useAdminData();

  if (loading) return <p className="section-sub">Loading users…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>Users</h1>
          <p className="section-sub">Registered QSO Dates members</p>
        </div>
      </div>
      {data && (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Callsign</th><th>Email</th></tr></thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="no-cap">{u.callsign}</td>
                  <td className="no-cap">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
