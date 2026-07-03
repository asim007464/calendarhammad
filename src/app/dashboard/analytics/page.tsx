import { AnalyticsDashboard } from "@/components/Analytics";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Analytics</h1>
        <p className="section-sub">Google Analytics &amp; Microsoft Clarity for qsodates.com</p>
      </div>
      <AnalyticsDashboard />
    </DashboardLayout>
  );
}
