"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { canAccessAdmin, loading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isLoggedIn || !canAccessAdmin)) {
      router.replace("/dashboard");
    }
  }, [loading, isLoggedIn, canAccessAdmin, router]);

  if (loading) {
    return (
      <div className="panel" style={{ padding: 24 }}>
        <p className="section-sub">Loading…</p>
      </div>
    );
  }

  if (!canAccessAdmin) return null;

  return <>{children}</>;
}
