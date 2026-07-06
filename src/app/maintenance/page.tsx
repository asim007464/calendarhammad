"use client";

import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";

export default function MaintenancePage() {
  const [message, setMessage] = useState("QSO Dates is temporarily offline for maintenance.");

  useEffect(() => {
    fetch("/api/site/public")
      .then((r) => r.json())
      .then((d) => {
        if (d.lockdown?.message) setMessage(d.lockdown.message);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card panel maintenance-card">
        <BrandMark link={false} size="auth" />
        <h1>Site Temporarily Offline</h1>
        <p className="section-sub">{message}</p>
        <p className="auth-hint">
          Admins can still sign in at <a href="/login?next=/admin">/login</a> to access the admin panel.
        </p>
      </div>
    </div>
  );
}
