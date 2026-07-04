"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function ExternalFeedsPage() {
  const router = useRouter();
  const { canAccessAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !canAccessAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, canAccessAdmin, router]);

  if (loading || !canAccessAdmin) {
    return (
      <DashboardLayout>
        <div className="panel" style={{ padding: 24 }}>
          <p className="section-sub">Redirecting…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="panel" style={{ padding: 24 }}>
        <h1 className="section-title">External Feeds</h1>
        <p className="section-sub">This section is no longer available on the public dashboard.</p>
      </div>
    </DashboardLayout>
  );
}
