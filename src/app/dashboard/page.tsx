import { DashboardLayout } from "@/components/DashboardLayout";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="panel" style={{ padding: 24 }}>
        <h1 className="section-title">Profile</h1>
        <p className="section-sub">Welcome to QSO Dates — manage your profile, activities, and external feeds.</p>

        <div className="admin-stats" style={{ marginTop: 24 }}>
          <div className="admin-stat">
            <span>Profile</span>
            <strong style={{ fontSize: 16 }}>Edit your digital card</strong>
            <Link href="/dashboard/profile" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Open</Link>
          </div>
          <div className="admin-stat">
            <span>External Feeds</span>
            <strong style={{ fontSize: 16 }}>eHamHub &amp; CQHams</strong>
            <Link href="/dashboard/external-feeds" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Connect</Link>
          </div>
          <div className="admin-stat">
            <span>Analytics</span>
            <strong style={{ fontSize: 16 }}>GA + Clarity</strong>
            <Link href="/dashboard/analytics" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>View</Link>
          </div>
          <div className="admin-stat">
            <span>Calendar</span>
            <strong style={{ fontSize: 16 }}>Public site</strong>
            <Link href="/" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}>Open</Link>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 24, padding: 20 }}>
          <h3>Recent Activity Feed</h3>
          <p className="section-sub">Views, clicks, and external interactions appear here and on your profile card.</p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 12 }}>
            Connect external feeds to see eHamHub and CQHams activity on your digital card.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
