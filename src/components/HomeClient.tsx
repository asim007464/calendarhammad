"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Activity, ActivityType, Broadcast } from "@/types/database";
import { statusOf } from "@/lib/activity-utils";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";
import { LiveUpcomingSection } from "@/components/LiveUpcomingSection";
import { ActivityDetailModal } from "@/components/ActivityDetailModal";
import { ActivityModal } from "@/components/ActivityModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createOpenDetailHandler } from "@/lib/activityDetail";
import { DEFAULT_HOMEPAGE, type HomepageContent } from "@/lib/siteSettings";

interface Props {
  initialActivities: Activity[];
  activityTypes: ActivityType[];
  broadcast: Broadcast | null;
}

export function HomeClient({ initialActivities, activityTypes, broadcast }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState(initialActivities);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Activity | null>(null);
  const [dismissedBroadcast, setDismissedBroadcast] = useState(false);
  const [toast, setToast] = useState("");
  const [homepage, setHomepage] = useState<HomepageContent>(DEFAULT_HOMEPAGE);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/activities");
    if (res.ok) setActivities(await res.json());
  }, []);

  const live = useMemo(() => activities.filter((a) => statusOf(a) === "live"), [activities]);
  const upcomingAll = useMemo(
    () => activities.filter((a) => statusOf(a) === "upcoming"),
    [activities],
  );
  const upcoming = useMemo(() => upcomingAll.slice(0, 8), [upcomingAll]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openAddActivity = () => {
    if (!isLoggedIn) {
      showToast("Please sign in to publish an activity.");
      router.push("/login?next=/");
      return;
    }
    setShowModal(true);
  };

  const openDetail = useMemo(() => createOpenDetailHandler(setDetail), []);

  useEffect(() => {
    fetch("/api/site/public")
      .then((r) => r.json())
      .then((d) => { if (d.homepage) setHomepage(d.homepage); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <>
      <Topbar
        onAddActivity={openAddActivity}
        onLoginRequired={() => showToast("Please sign in to publish an activity.")}
      />

      <section className="hero">
        <div className="hero-inner hero-inner--home">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="pulse-dot" />
              {homepage.eyebrow}
            </span>
            <h1>
              {homepage.title.includes("Ham Radio") ? (
                <>
                  {homepage.title.split("Ham Radio")[0]}
                  <span className="gradient-text">Ham Radio{homepage.title.split("Ham Radio")[1]}</span>
                </>
              ) : (
                <span className="gradient-text">{homepage.title}</span>
              )}
            </h1>
            <p className="hero-lead">{homepage.lead}</p>
            <div className="hero-cta">
              <button type="button" className="btn btn-primary btn-lg" onClick={openAddActivity}>
                {authLoading ? homepage.ctaPublish : isLoggedIn ? homepage.ctaPublish : "Sign In to Publish"}
              </button>
              <Link href="/activities" className="btn btn-outline btn-lg">{homepage.ctaBrowse}</Link>
              <Link href="/calendar" className="btn btn-ghost btn-lg">{homepage.ctaCalendar}</Link>
            </div>
          </div>
          <div className="stats-grid">
            <Link href="/activities?filter=live" className="stat-card stat-card-link stat-live">
              <div className="stat-label">{homepage.statLive}</div>
              <div className="stat-value">{live.length}</div>
            </Link>
            <Link href="/activities" className="stat-card stat-card-link">
              <div className="stat-label">{homepage.statTotal}</div>
              <div className="stat-value">{activities.length}</div>
            </Link>
            <Link href="/api-docs" className="stat-card stat-card-link">
              <div className="stat-label">{homepage.statApi}</div>
              <div className="stat-value stat-value--hint">API</div>
            </Link>
            <Link href="/activities?filter=upcoming" className="stat-card stat-card-link">
              <div className="stat-label">{homepage.statUpcoming}</div>
              <div className="stat-value">{upcomingAll.length}</div>
            </Link>
          </div>
        </div>
      </section>

      {broadcast && !dismissedBroadcast && (
        <div className="broadcast-banner" style={{ maxWidth: 1264, margin: "0 auto 16px", padding: "0 28px" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(198,255,52,0.15), rgba(198,255,52,0.05))", border: "1px solid rgba(198,255,52,0.3)", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 className="no-cap">{broadcast.title}</h3>
              <p>{broadcast.message}</p>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissedBroadcast(true)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <LiveUpcomingSection live={live} upcoming={upcoming} onSelect={openDetail} />

      {detail && <ActivityDetailModal activity={detail} onClose={() => setDetail(null)} />}

      {showModal && (
        <ActivityModal
          activityTypes={activityTypes}
          editing={null}
          onClose={() => setShowModal(false)}
          onSaved={(msg) => { setShowModal(false); refresh(); showToast(msg || "Activity saved!"); }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      <Footer />
    </>
  );
}
